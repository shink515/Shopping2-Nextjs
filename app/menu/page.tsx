"use client"

import React from "react";
import {use, useState} from "react";
import {useEffect} from "react";
import {useRouter} from "next/navigation";

// メニューJsonデータ受け取り用 型
type Menu = {
    id : number
    commodityName : string
    price : number
}

export default function MenuList() {

    const router = useRouter();
    // メニューデータ格納用
    const[ menus , setMenus ] = useState<Menu[]>([]);

    const springUrl = "http://localhost:8080";

    useEffect(() => {
        const fetchData = async () => {

            console.log("通信開始");

            try{
                
                const response = await fetch(springUrl + "/menu/list");

                if(!response.ok){
                    console.log("サーバーエラーが発生しました:", response.status);
                    return;
                }

                const json = await response.json();
                setMenus(json);

            }catch(error){
                console.log("通信失敗", error);
                return;
            }


        };

        fetchData();

    },[]);
    
    const addToCart = async (id : number) => {
        
        try{
            const response = await fetch(springUrl + `/cart/order/add?id=${id}`, { method: 'POST' });

            if(!response.ok){
                console.log("エラー");
            }

        }catch(error){
            console.log("通信失敗", error);
        }
    };

    const clear = async () => {

        try{
            const response = await fetch(springUrl + "/cart/all/clear");

            if(!response.ok){
                console.log("エラー2");
            }

        }catch(error){
            console.log("通信失敗" , error);
        }
    };

    // メニュー一覧画面
    return(
        <div>
            <table>
                <thead>
                    <tr>
                        <th>商品名</th>
                        <th>価格</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {menus?.map((menu) => {
                        return(
                            <tr key={menu?.id}>
                            <td>{menu?.commodityName}</td>
                            <td>{menu?.price}</td>
                            <td>
                                <button onClick={() => addToCart(menu?.id)}>追加</button>
                            </td>
                        </tr>
                        )
                    })}
                </tbody>
            </table>
                <button onClick={() => router.push("/cart")}>カートを見る</button>
                <button onClick={() => clear()}>カートの商品をクリアする</button>
        </div>
    );
}