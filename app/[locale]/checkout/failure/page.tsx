"use client";

import { XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useTranslations } from 'next-intl';

export default function CheckoutFailurePage() {
    const t = useTranslations('Checkout.Failure');

    return (
        <div className="min-h-screen bg-secondary flex items-center justify-center p-6">
            <div className="bg-surface max-w-md w-full p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-white/5 text-center space-y-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <XCircle className="w-10 h-10 text-red-600" />
                </div>

                <h1 className="text-3xl font-bold font-accent text-text-main">{t('title')}</h1>

                <p className="text-text-sec">
                    {t('message')}
                </p>

                <div className="pt-4 flex flex-col gap-3">
                    <Link href="/checkout">
                        <Button variant="outline" className="w-full">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {t('tryAgain')}
                        </Button>
                    </Link>
                    <Link href="/#contact">
                        <Button variant="ghost" className="w-full">{t('support')}</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
