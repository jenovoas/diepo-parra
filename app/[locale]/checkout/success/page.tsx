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
        <div className="min-h-screen bg-secondary dark:bg-gray-900 flex items-center justify-center p-6">
            <div className="bg-surface dark:bg-gray-800 max-w-md w-full p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>

                <h1 className="text-3xl font-bold font-accent text-text-main dark:text-white">{t('title')}</h1>

                <p className="text-text-sec dark:text-gray-400">
                    {t('message')}
                </p>

                {paymentId && (
                    <div className="bg-secondary dark:bg-gray-700/50 p-4 rounded-xl text-sm font-mono text-text-sec dark:text-gray-400">
                        {t('txId')} <span className="text-text-main dark:text-white font-bold">{paymentId}</span>
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
