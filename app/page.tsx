"use client";

import type React from "react";
import Image from "next/image";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Info, CreditCard, Smartphone, Wallet, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Client, Databases, Query } from 'node-appwrite';
import * as XLSX from 'xlsx';


const client = new Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('688b52ec003360213d85').setKey('standard_f32d660e7b6655d82674b873ccb7c696fbc4a814b3d277184fbbfe6d26c74346fd06f9e6bed5a8f0d36f92f47bfd89004a4d8fbfd53c8ee058d2e4ccb5108c0a8c3298fb13b7b2b8bc787a0a80f45fe6c9458a2ebfd4d577953b73d5f8580ef198314a99af2de49d3d63d0cd24e664f807de8cb9a97295d46cbeefc5e17154f1');

const db = new Databases(client);

const formPrice = Number (process.env.NEXT_PUBLIC_FORM_PRICE || 1500000);

export default function DisbursementApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [qrisCount, setQrisCount] = useState(0);
  const [otherCount, setOtherCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [isDisbursementLoading, setIsDisbursementLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleDeleteDatabase = async () => {
    setIsLoading(true);
    const documents = await db.listDocuments(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_REGISTRAR_ID!,
      [Query.limit(3)]
      // [Query.select(['$id']), Query.limit(100)]
    );
    // while (documents.documents.length < documents.total) {
    //   const nextResponse = await db.listDocuments(
    //     process.env.NEXT_PUBLIC_DATABASE_ID!,
    //     process.env.NEXT_PUBLIC_REGISTRAR_ID!,
    //     [Query.select(['$id']), Query.limit(100), Query.offset(documents.documents.length)]
    //   );
    //   documents.documents.push(...nextResponse.documents);
    // }
    // await Promise.all(documents.documents.map(async (document: any) => {
    //   await db.deleteDocument(  
    //     process.env.NEXT_PUBLIC_DATABASE_ID!,
    //     process.env.NEXT_PUBLIC_REGISTRAR_ID!,
    //     document.$id
    //   );
    //   console.log('Deleted document: ' + document.$id);
    // }));
    setIsLoading(false);
    setIsDialogOpen(false); // Tutup dialog setelah selesai
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation - in real app, you'd validate against a backend
    if (username === process.env.NEXT_PUBLIC_USERNAME && password === process.env.NEXT_PUBLIC_PASSWORD) {
      setIsLoggedIn(true);
      fetchTransactionSummary();
      fetchDisbursementData();
    } else {
      alert("Username atau password salah");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
  };

  const fetchTransactionSummary = async () => {
    setIsLoading(true);
    const response = await db.listDocuments(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_PAYMENT_ID!,
      [Query.select(['paymentMethod', 'uniqueCode']), Query.limit(100)]
    );

    while (response.documents.length < response.total) {
      const nextResponse = await db.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_PAYMENT_ID!,
        [Query.select(['paymentMethod', 'uniqueCode']), Query.limit(100), Query.offset(response.documents.length)]
      );
      response.documents.push(...nextResponse.documents);
    }

    setQrisCount(response.documents.filter((doc: any) => doc.paymentMethod === 'QRIS').length);
    setOtherCount(response.documents.filter((doc: any) => doc.paymentMethod === 'OTHER').length);
    setIsLoading(false);
  };

  const fetchDisbursementData = async () => {
    setIsDisbursementLoading(true);
    const [balance, pendingBalance] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_XENDIT_BALANCE_URL}`, {
        headers: {
          "Authorization": `Basic ${process.env.NEXT_PUBLIC_XENDIT_KEY}`,
          "for-user-id": process.env.NEXT_PUBLIC_XENDIT_USER_ID || "",
        },
      }),
      fetch(`${process.env.NEXT_PUBLIC_XENDIT_BALANCE_URL}?account_type=HOLDING`, {
        headers: {
          "Authorization": `Basic ${process.env.NEXT_PUBLIC_XENDIT_KEY}`,
          "for-user-id": process.env.NEXT_PUBLIC_XENDIT_USER_ID || "",
        },
      }),
    ]);

    const balanceData = await balance.json();
    const pendingBalanceData = await pendingBalance.json();

    setBalance(balanceData.balance);
    setPendingBalance(pendingBalanceData.balance);
    setIsDisbursementLoading(false);
  };

  const exportAllData = async () => {
    setIsExporting(true);
    
    try {
      // Fetch all registrar data
      const registrarData = await fetchAllDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_REGISTRAR_ID!
      );
      
      // Fetch all payment data
      const paymentData = await fetchAllDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_PAYMENT_ID!
      );
      
      // Create a map of payment data by uniqueCode for faster lookup
      const paymentMap: Record<string, any> = {};
      paymentData.forEach(payment => {
        paymentMap[payment.uniqueCode] = payment;
      });
      
      // Merge data based on uniqueCode
      const mergedData = registrarData.map(registrar => {
        const payment = paymentMap[registrar.uniqueCode] || {};
        const { $id, $createdAt, $updatedAt, $permissions,$sequence, $databaseId, $collectionId,currentSchoolYearParsed, ...cleanRegistrar } = registrar;
        return {
          ...cleanRegistrar,
          paymentMethod: payment.paymentMethod || '-',
          paymentDate: payment.$createdAt || '-',
          amount: payment.paymentMethod === undefined ? 0 : 1500000,
          package: payment.package || '-'
        };
      });
      
      // Export to Excel
      const worksheet = XLSX.utils.json_to_sheet(mergedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Registrasi");
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `UPHC_Registrasi_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Gagal mengekspor data. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };
  
  const fetchAllDocuments = async (databaseId: string, collectionId: string) => {
    // First batch
    const documents = await db.listDocuments(
      databaseId,
      collectionId,
      [Query.limit(100)]
    );
    
    // Continue fetching if there are more documents
    while (documents.documents.length < documents.total) {
      const nextResponse = await db.listDocuments(
        databaseId,
        collectionId,
        [Query.limit(100), Query.offset(documents.documents.length)]
      );
      documents.documents.push(...nextResponse.documents);
    }
    
    return documents.documents;
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="flex justify-center">
            <Image
              src="/images/uph-logo.png"
              alt="UPH College Logo"
              width={800}
              height={800}
              className="h-20 w-auto object-contain"
            />
          </div>
          <Card className="border-gray-200 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-black">
                Login
              </CardTitle>
              <CardDescription className="text-gray-600">
                Masuk ke UPHC Open House Portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-black">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Masukkan username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-black">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Masuk
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-md mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 pt-4">
          <div className="w-full flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white bg-transparent"
            >
              Keluar
            </Button>
          </div>
          <Image
            src="/images/uph-logo.png"
            alt="UPH College Logo"
            width={800}
            height={800}
            className="h-20 w-auto object-contain"
          />
          <div className="text-center">
            <h1 className="text-xl font-bold text-black">
              UPHC Open House Portal
            </h1>
          </div>
        </div>

        {/* Summary Section */}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-black">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  Ringkasan Transaksi
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Total transaksi hari ini
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white bg-transparent"
                onClick={exportAllData}
                disabled={isExporting}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {isExporting ? "Mengekspor..." : "Export All Data"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* QRIS Transactions */}
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Smartphone className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-black">QRIS</p>
                  <p className="text-sm text-gray-600">
                    {isLoading ? "Loading..." : qrisCount + " transaksi"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-black">
                  {isLoading ? "Loading..." : formatRupiah(qrisCount*formPrice)}
                </p>
              </div>
            </div>

            {/* Other Transactions */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Wallet className="h-4 w-4 text-green-600" />
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                      <DialogHeader>
                        <DialogTitle className="text-black">Hapus Database</DialogTitle>
                        <DialogDescription className="text-left text-gray-700">
                          Apakah Anda yakin ingin menghapus database pendaftaran ?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button onClick={handleDeleteDatabase} className="bg-teal-600 hover:bg-teal-700">Konfirmasi</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div>
                  <p className="font-medium text-black">Lainnya (EDC/Transfer)</p>
                  <p className="text-sm text-gray-600">
                    {isLoading ? "Loading..." : otherCount + " transaksi"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-black">
                  {isLoading ? "Loading..." : formatRupiah(otherCount*formPrice)}
                </p>
              </div>
            </div>

            <Separator className="bg-gray-200" />

            {/* Total */}
            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg border border-gray-200">
              <div>
                <p className="font-semibold text-black">Total</p>
                <p className="text-sm text-gray-600">
                  {isLoading ? "Loading..." : qrisCount + otherCount + " transaksi"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-black">
                  {isLoading ? "Loading..." : formatRupiah(qrisCount*formPrice + otherCount*formPrice)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disbursement Section */}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Wallet className="h-5 w-5 text-gray-600" />
              Disbursement
            </CardTitle>
            <CardDescription className="text-gray-600">
              Saldo dan penarikan dana
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Available Balance */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Saldo Tersedia
                  </p>
                  <p className="text-2xl font-bold text-black">
                    {isDisbursementLoading ? "Loading..." : formatRupiah(balance)}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 border-green-200"
                >
                  Siap Tarik
                </Badge>
              </div>

                Hubungi Tim Otter untuk Tarik Dana
          
            </div>

            {/* Pending Balance */}
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-orange-800">
                    Saldo Pending
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-orange-100"
                      >
                        <Info className="h-4 w-4 text-orange-600" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-black">
                          <Clock className="h-5 w-5 text-gray-600" />
                          Waktu Settlement
                        </DialogTitle>
                        <DialogDescription className="text-left text-gray-700">
                          Dana akan tersedia untuk ditarik dalam waktu T+2 hari
                          kerja dari waktu transaksi dibuat.
                          <br />
                          <br />
                          <strong>Contoh:</strong> Transaksi pada hari Senin
                          akan tersedia untuk ditarik pada hari Rabu.
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-800 border-orange-200"
                >
                  T+2 Hari Kerja
                </Badge>
              </div>
              <p className="text-2xl font-bold text-black">
                {isDisbursementLoading ? "Loading..." : formatRupiah(pendingBalance)}
              </p>
            </div>

            {/* Total Balance */}
            <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-600">Total Saldo</p>
              <p className="text-xl font-bold text-black">
                {isDisbursementLoading ? "Loading..." : formatRupiah(
                  balance +
                    pendingBalance
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
