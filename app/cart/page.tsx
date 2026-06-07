"use client";

import React from "react";
import { useState , useEffect } from "react";
import { useRouter } from "next/navigation";

type Order = {
    commodityId : number
    quantity : number
    menu : {
        id : number
        commodityName : string
        price : number
    }
}

export default function CartList(){
    const router = useRouter();
    const[orders, setOrders] = useState<Order[]>();
    const[quantity, setQuantity] = useState();
    const[sum, setSum] = useState();

    // SpringBootプロジェクト パス
    const springUrl = "http://localhost:8080";

    // SpringBootを経由してDBからカート情報を取得 → ステートメントへ格納
    // ページアクセス時のみ実行
    useEffect(() => {
        const cartListFetch = async () => {

            try{
                const response = await fetch(springUrl + "/cart/list");
                const json = await response.json();
                setOrders(json);
    
            }catch(error){
                console.log("エラー", error);
                return;
            }
        }

        cartListFetch();

    },[]);

    // セレクトボックス数量を選択 → SpringBootセッション内 商品データを変更 → セッションデータ（カートリスト)を受け取る → ステイトメントに反映
    const changeQuantity = async (commodityId:number, quantity:number) => {

        try{
            const response = await fetch(springUrl + `/cart/quantity/change?commodityId=${commodityId}&quantity=${quantity}`, {method:"post"});

            if(!response.ok){
                console.log("通信失敗", response);
                return;
            }

            const json = await response.json();
            setOrders(json);

        }catch(error){
            console.log("エラー",error);
            return;
        }
    }

    // SpringBootのセッションからIDに該当した商品を削除 → セッションデータ（カート内商品リスト）を受け取る → ステイトメントに反映
    const deleteCommodity = async (commodityId:number) => {

        try{
            const response = await fetch(springUrl + `/cart/order/delete?commodityId=${commodityId}`, {method:"post"});

            if(!response.ok){
                console.log("通信失敗", response);
                return;
            }

            const json = await response.json();
            setOrders(json);

        }catch(error){
            console.log("エラー",error);
            return;
        }
    }

    // セッションのデータをDBに反映させる
    const registCart = async () => {

        try{
            await fetch(springUrl + "/cart/regist");

        }catch(error){
            console.log("エラー", error);
            return;
        }
    }

    // 購入ボタン押下 → カートの中身を削除 → DBに反映
    const purchase = async () => {

        try{
            const response = await fetch(springUrl + "/cart/purchase");

            if(!response.ok){
                console.log("通信失敗", response);
                return;
            }

            const json = await response.json();
            setOrders(json);

        }catch(error){
            console.log("エラー",error);
        }
    }

    return(
        <div>
            <table>
                <thead>
                    <tr>
                        <th>商品名</th>
                        <th>単価</th>
                        <th>個数</th>
                        <th>小計</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {orders?.map(order => {
                        return(
                            <tr key={order?.commodityId}>
                                <td>{order?.menu?.commodityName}</td>
                                <td>{order?.menu?.price}</td>
                                <td>
                                    <select defaultValue={order?.quantity} onChange={(e) => changeQuantity(order?.commodityId, Number(e.target.value))}>
                                        {[...Array(50)].map((_, index) => {
                                            const num = index + 1;

                                            return(
                                                <option key={num} value={num}>{num}</option>
                                            );
                                        })}
                                    </select>
                                </td>
                                <td>{order?.menu?.price * order?.quantity}</td>
                                <td>
                                    <button onClick={() => deleteCommodity(order?.commodityId)}>削除</button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
           <div>合計金額：</div>
           <button onClick={() => router.push("/menu")}>カートに戻る</button>
           <button onClick={() => registCart()}>一時保存</button>
           <button onClick={() => purchase()}>購入</button>
        </div>
    );
}

