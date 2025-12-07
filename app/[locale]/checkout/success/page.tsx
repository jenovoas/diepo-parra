"use client";

import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from 'next-intl';

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const paymentId = searchParams.get("payment_id");

    const t = useTranslations('Checkout.Success');

    return (
        <div className="min-h-screen bg-secondary flex items-center justify-center p-6">
            <div className="bg-surface max-w-md w-full p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-white/5 text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>

                <h1 className="text-3xl font-bold font-accent text-text-main">{t('title')}</h1>

                <p className="text-text-sec">
                    {t('message')}
                </p>

                {paymentId && (
                    <div className="bg-secondary/50 p-4 rounded-xl text-sm font-mono text-text-sec">
                        {t('txId')} <span className="text-text-main font-bold">{paymentId}</span>
                    </div>
                )}

                <div className="pt-4">
                    <Link href="/">
                        <Button className="w-full">{t('backHome')}</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
