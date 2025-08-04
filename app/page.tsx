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

export default function DisbursementApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation - in real app, you'd validate against a backend
    if (username && password) {
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
  };

  // Mock data for dashboard
  const summaryData = {
    qris: {
      count: 1247,
      amount: 45750000,
    },
    others: {
      count: 892,
      amount: 32150000,
    },
  };

  const disbursementData = {
    availableBalance: 12500000,
    pendingBalance: 8750000,
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
                Export
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
                    {summaryData.qris.count} transaksi
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-black">
                  {formatRupiah(summaryData.qris.amount)}
                </p>
              </div>
            </div>

            {/* Other Transactions */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Wallet className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-black">Lainnya</p>
                  <p className="text-sm text-gray-600">
                    {summaryData.others.count} transaksi
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-black">
                  {formatRupiah(summaryData.others.amount)}
                </p>
              </div>
            </div>

            <Separator className="bg-gray-200" />

            {/* Total */}
            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg border border-gray-200">
              <div>
                <p className="font-semibold text-black">Total</p>
                <p className="text-sm text-gray-600">
                  {summaryData.qris.count + summaryData.others.count} transaksi
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-black">
                  {formatRupiah(
                    summaryData.qris.amount + summaryData.others.amount
                  )}
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
                    {formatRupiah(disbursementData.availableBalance)}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 border-green-200"
                >
                  Siap Tarik
                </Badge>
              </div>
              <Button className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white">
                Tarik Dana
              </Button>
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
                {formatRupiah(disbursementData.pendingBalance)}
              </p>
            </div>

            {/* Total Balance */}
            <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-600">Total Saldo</p>
              <p className="text-xl font-bold text-black">
                {formatRupiah(
                  disbursementData.availableBalance +
                    disbursementData.pendingBalance
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
