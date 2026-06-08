"use client"

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Menu = {
    id: number
    commodityName: string
    price: number
}

export default function MenuList() {
    const router = useRouter();
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const springUrl = "http://localhost:8080";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(springUrl + "/menu/list", { credentials: "include" });
                if (!response.ok) return;
                const json = await response.json();
                setMenus(json);
            } catch (error) {
                console.log("通信失敗", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const addToCart = async (id: number, name: string) => {
        try {
            const response = await fetch(springUrl + `/cart/order/add?id=${id}`, { method: 'POST', credentials: "include" });
            await response.text();
            showToast(`🛒 ${name} をカートに追加しました！`);
        } catch (error) {
            console.log("通信失敗", error);
        }
    };

    const handleClearCart = async () => {
        try {
            const response = await fetch(springUrl + "/cart/all/clear", { credentials: "include" });
            await response.text();
            showToast("🧹 カートを空っぽにしました");
        } catch (error) {
            console.log("通信失敗", error);
        }
        setShowConfirm(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50/60 to-orange-50/40 text-neutral-800 antialiased py-16 px-4 sm:px-6 lg:px-8">
            {/* トースト通知 (温かみのあるオレンジアクセント) */}
            {toastMessage && (
                <div className="fixed top-5 right-5 z-50 bg-neutral-900 text-amber-100 px-6 py-3.5 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2 border border-amber-500/30 animate-bounce-short">
                    <span className="text-amber-400">●</span> {toastMessage}
                </div>
            )}

            {/* カスタム確認ダイアログ */}
            {showConfirm && (
                <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-orange-100">
                        <h3 className="text-lg font-bold text-neutral-900 mb-2">カートのクリア</h3>
                        <p className="text-neutral-500 text-sm mb-6">カートの中身をすべて削除してもよろしいですか？</p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-sm font-medium text-neutral-400 hover:bg-neutral-100 rounded-xl transition-colors">キャンセル</button>
                            <button onClick={handleClearCart} className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-sm shadow-red-100">削除する</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto">
                {/* ヘッダーエリア */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-orange-200/60 pb-6 mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-neutral-900">
                            Fruit <span className="text-orange-500">Market</span>
                        </h1>
                        <p className="text-orange-700/70 text-sm mt-1 font-medium">新鮮なフルーツをお届けします</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button 
                            onClick={() => setShowConfirm(true)}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-3 text-sm font-semibold text-neutral-500 hover:text-red-500 bg-white hover:bg-red-50/50 border border-neutral-200 hover:border-red-200 rounded-xl transition-all duration-200 active:scale-95"
                        >
                            カートを空にする
                        </button>
                        <button 
                            onClick={() => router.push("/cart")}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-md shadow-orange-500/20 transition-all duration-200 active:scale-95 gap-2"
                        >
                            カートを見る
                            <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-white animate-pulse"></span>
                        </button>
                    </div>
                </div>

                {/* ローディング */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white/60 rounded-2xl h-80 border border-orange-100 animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    /* メニューグリッド */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {menus?.map((menu) => {
                            // 商品タイプごとの色分け設定
                            let bgWrapper = "bg-amber-50/50 group-hover:bg-amber-100/60"; // バナナ等
                            let tokenColor = "text-amber-600 bg-amber-100";
                            let imgSrc = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgNtUR1ksjXGJrJuKvasxsxzXsmHg19Sijij3bYh-ad9Zlyt__d2uGbMOkx06LR55mYWc270w5WBssx5lYz6qd21RT4mDJLy9ppwDNkxI19xhPMWsTwarzDSSADvK8N1zPf9txO0WmF8NOL/s400/fruit_banana_character.png";

                            if (menu?.id === 2) { // りんご
                                bgWrapper = "bg-rose-50/50 group-hover:bg-rose-100/60";
                                tokenColor = "text-rose-600 bg-rose-100";
                                imgSrc = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg4XgoY3TV5K-XWwDBGigF8g4j410bWlgXZiB8pW2ooY7SvGwcgiGBR2pH2Wk9qNiB-Hnz6rsN246p3qSXhwryrVpK_9HUcwzQaT37LtVPgDUBwlg2B3Xq8aDoRw4c_eA_ttQYEylVdqx_d/s400/character_apple.png";
                            } else if (menu?.id === 3) { // パイナップル
                                bgWrapper = "bg-emerald-50/50 group-hover:bg-emerald-100/60";
                                tokenColor = "text-emerald-600 bg-emerald-100";
                                imgSrc = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEipfSiHWnrcxKv8voU7A9VO7vTQA5ILTOrR_V4q2ZIYZQKC_AAjbVvDhDXY225_Pu5mYM3f2GveXfixjmNBFW0QrUDDfJoPaaOqEW0Ori8m2TzgXMnNs_f6BQ-Yfb7oW_tuGL4Rz4A6arRY/s400/character_pineapple.png";
                            }

                            return (
                                <div 
                                    key={menu?.id} 
                                    className="group bg-white rounded-2xl overflow-hidden border border-orange-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                                >
                                    {/* フルーツごとのテーマカラー背景 */}
                                    <div className={`aspect-square relative overflow-hidden flex items-center justify-center border-b border-orange-50 p-6 transition-colors duration-300 ${bgWrapper}`}>
                                        <img
                                            src={imgSrc}
                                            alt={menu?.commodityName}
                                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out"
                                        />
                                        <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${tokenColor}`}>
                                            FRESH
                                        </span>
                                    </div>

                                    {/* コンテンツ */}
                                    <div className="p-5 flex flex-col flex-grow">
                                        <h2 className="font-bold text-neutral-800 text-base mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors">
                                            {menu?.commodityName}
                                        </h2>
                                        <p className="text-orange-600 font-black text-xl mb-5 mt-auto">
                                            ¥{menu?.price?.toLocaleString()}
                                        </p>
                                        <button 
                                            onClick={() => addToCart(menu?.id, menu?.commodityName)}
                                            className="w-full bg-orange-50/60 hover:bg-orange-500 text-orange-700 hover:text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 active:scale-95 text-xs tracking-wider"
                                        >
                                            カートに追加する
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}