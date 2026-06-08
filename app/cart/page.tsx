"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Order = {
  commodityId: number;
  quantity: number;
  menu: {
    id: number;
    commodityName: string;
    price: number;
  };
};

export default function CartList() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);

  const springUrl = "http://localhost:8080";

  useEffect(() => {
    const cartListFetch = async () => {
      try {
        const response = await fetch(springUrl + "/cart/list", { credentials: "include" });
        const json = await response.json();
        setOrders(json);
      } catch (error) {
        console.log("エラー", error);
      }
    };
    cartListFetch();
  }, []);

  const sumMoney = useMemo(() => {
    return orders.reduce((sum, order) => {
      return sum + (order.menu.price || 0) * (order.quantity || 0);
    }, 0);
  }, [orders]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const changeQuantity = async (commodityId: number, quantity: number) => {
    try {
      const response = await fetch(
        springUrl + `/cart/quantity/change?commodityId=${commodityId}&quantity=${quantity}`,
        { method: "post", credentials: "include" }
      );
      if (!response.ok) return;
      const json = await response.json();
      setOrders(json);
      showToast("🔄 数量を更新しました");
    } catch (error) {
      console.log("エラー", error);
    }
  };

  const deleteCommodity = async (commodityId: number, name: string) => {
    try {
      const response = await fetch(
        springUrl + `/cart/order/delete?commodityId=${commodityId}`,
        { method: "post", credentials: "include" }
      );
      if (!response.ok) return;
      const json = await response.json();
      setOrders(json);
      showToast(`🗑️ ${name} をカートから外しました`);
    } catch (error) {
      console.log("エラー", error);
    }
  };

  const registCart = async () => {
    try {
      const response = await fetch(springUrl + "/cart/regist", { credentials: "include" });
      await response.text();
      showToast("💾 カートを一時保存しました");
    } catch (error) {
      console.log("エラー", error);
    }
  };

  const handlePurchase = async () => {
    try {
      const response = await fetch(springUrl + "/cart/purchase", { credentials: "include" });
      if (!response.ok) return;
      const json = await response.json();
      setOrders(json);
      showToast("🎉 ご購入ありがとうございました！");
    } catch (error) {
      console.log("エラー", error);
    }
    setShowPurchaseConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 to-orange-50/40 text-neutral-800 antialiased py-16 px-4 sm:px-6 lg:px-8">
      {/* トースト */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-neutral-900 text-amber-100 px-6 py-3.5 rounded-2xl shadow-xl text-sm font-semibold border border-amber-500/30">
          {toastMessage}
        </div>
      )}

      {/* 購入確認ダイアログ */}
      {showPurchaseConfirm && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-orange-100">
            <h3 className="text-lg font-bold text-neutral-900 mb-2">注文の確定</h3>
            <p className="text-neutral-500 text-sm mb-6">合計金額 <strong>¥{sumMoney.toLocaleString()}</strong> の注文を確定してよろしいですか？</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowPurchaseConfirm(false)} className="px-4 py-2 text-sm font-medium text-neutral-400 hover:bg-neutral-100 rounded-xl transition-colors">戻る</button>
              <button onClick={handlePurchase} className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl transition-colors shadow-sm shadow-orange-500/20">確定する</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black tracking-tight text-neutral-900 mb-10 border-b border-orange-200/60 pb-5">
          Shopping <span className="text-orange-500">Cart</span>
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-orange-100 p-12 text-center shadow-sm">
            <p className="text-neutral-400 font-medium mb-6">カートの中は空っぽです 🧺</p>
            <button
              onClick={() => router.push("/menu")}
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-md shadow-orange-500/10 transition-all duration-200 active:scale-95"
            >
              お買い物を続ける
            </button>
          </div>
        ) : (
          <>
            {/* カートテーブル */}
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-orange-50 text-orange-700/60 text-xs font-bold uppercase tracking-wider bg-orange-50/40">
                      <th className="py-4 px-6">商品</th>
                      <th className="py-4 px-4 text-right">単価</th>
                      <th className="py-4 px-4 text-center">個数</th>
                      <th className="py-4 px-4 text-right">小計</th>
                      <th className="py-4 px-6"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-50/60 text-sm">
                    {orders.map((order) => {
                      let bgImgWrapper = "bg-amber-50/60";
                      let imgSrc = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgNtUR1ksjXGJrJuKvasxsxzXsmHg19Sijij3bYh-ad9Zlyt__d2uGbMOkx06LR55mYWc270w5WBssx5lYz6qd21RT4mDJLy9ppwDNkxI19xhPMWsTwarzDSSADvK8N1zPf9txO0WmF8NOL/s400/fruit_banana_character.png";

                      if (order.commodityId === 2) {
                        bgImgWrapper = "bg-rose-50/60";
                        imgSrc = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg4XgoY3TV5K-XWwDBGigF8g4j410bWlgXZiB8pW2ooY7SvGwcgiGBR2pH2Wk9qNiB-Hnz6rsN246p3qSXhwryrVpK_9HUcwzQaT37LtVPgDUBwlg2B3Xq8aDoRw4c_eA_ttQYEylVdqx_d/s400/character_apple.png";
                      } else if (order.commodityId === 3) {
                        bgImgWrapper = "bg-emerald-50/60";
                        imgSrc = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEipfSiHWnrcxKv8voU7A9VO7vTQA5ILTOrR_V4q2ZIYZQKC_AAjbVvDhDXY225_Pu5mYM3f2GveXfixjmNBFW0QrUDDfJoPaaOqEW0Ori8m2TzgXMnNs_f6BQ-Yfb7oW_tuGL4Rz4A6arRY/s400/character_pineapple.png";
                      }

                      return (
                        <tr key={order.commodityId} className="hover:bg-orange-50/20 transition-colors duration-150">
                          <td className="py-5 px-6 text-neutral-900">
                            <div className="flex items-center gap-4">
                              <div className={`w-14 h-14 rounded-xl border border-orange-100 p-2 flex items-center justify-center flex-shrink-0 ${bgImgWrapper}`}>
                                <img src={imgSrc} alt={order.menu.commodityName} className="w-full h-full object-contain" />
                              </div>
                              <span className="font-bold text-base">{order.menu.commodityName}</span>
                            </div>
                          </td>
                          <td className="py-5 px-4 text-right text-neutral-500 font-medium">
                            ¥{order.menu.price.toLocaleString()}
                          </td>
                          <td className="py-5 px-4 text-center">
                            <select
                              value={order.quantity}
                              onChange={(e) => changeQuantity(order.commodityId, Number(e.target.value))}
                              className="bg-orange-50/40 border border-orange-200 rounded-xl px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-300 text-neutral-700 cursor-pointer transition-all"
                            >
                              {[...Array(50)].map((_, index) => (
                                <option key={index + 1} value={index + 1}>{index + 1}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-5 px-4 text-right font-black text-neutral-900 text-base">
                            ¥{(order.menu.price * order.quantity).toLocaleString()}
                          </td>
                          <td className="py-5 px-6 text-right">
                            <button
                              onClick={() => deleteCommodity(order.commodityId, order.menu.commodityName)}
                              className="text-xs font-bold text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-all"
                            >
                              削除
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 会計サマリー */}
            <div className="flex flex-col items-end gap-6 bg-white rounded-2xl border border-orange-100 shadow-sm p-8">
              <div className="flex justify-between items-baseline w-full sm:w-80 border-b border-orange-100 pb-5">
                <span className="text-sm font-bold text-neutral-400 uppercase tracking-wider">合計金額</span>
                <span className="text-3xl font-black text-orange-600">
                  ¥{sumMoney.toLocaleString()}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={() => router.push("/menu")}
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-neutral-500 hover:text-neutral-800 bg-white border border-neutral-200 hover:border-neutral-300 rounded-xl transition-all duration-200 active:scale-95 order-3 sm:order-1"
                >
                  メニューに戻る
                </button>
                <button
                  onClick={registCart}
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-orange-700 hover:text-orange-900 bg-orange-50/60 hover:bg-orange-100/80 rounded-xl transition-all duration-200 active:scale-95 order-2"
                >
                  一時保存
                </button>
                <button
                  onClick={() => setShowPurchaseConfirm(true)}
                  className="inline-flex items-center justify-center px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-md shadow-orange-500/20 transition-all duration-200 active:scale-95 order-1 sm:order-3"
                >
                  注文を確定する
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}