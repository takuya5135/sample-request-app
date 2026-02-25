'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function HelpDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-blue-600">
                    <span className="text-xl">❓</span>
                    <span className="sr-only">ヘルプ</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-2 border-b">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        ❓ 操作マニュアル (HOW TO)
                    </DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-10 pb-10">
                        {/* 1. 住所録 */}
                        <section className="space-y-4">
                            <h3 className="text-xl font-bold flex items-center gap-2 border-l-4 border-blue-600 pl-3">
                                👥 1. 住所録（マスタ）の管理
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                まずは、頻繁に送る宛先を「住所録の管理」から登録しましょう。
                            </p>
                            <div className="bg-blue-50 p-4 rounded-lg space-y-2 border border-blue-100">
                                <h4 className="font-bold text-blue-900 flex items-center gap-1">
                                    💡 名刺画像・メール署名からAI登録
                                </h4>
                                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                                    <li><strong>名刺</strong>: スマホでの撮影やペーストで画像をアップロード。</li>
                                    <li><strong>署名</strong>: メールの署名を貼り付けて「AIで解析」。</li>
                                    <li><strong>メリット</strong>: 氏名・会社名・住所などをAIが自動判別して一括入力します。</li>
                                </ul>
                            </div>
                        </section>

                        {/* 2. 商品リスト */}
                        <section className="space-y-4">
                            <h3 className="text-xl font-bold flex items-center gap-2 border-l-4 border-green-600 pl-3">
                                📦 2. 商品リストの管理
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                商品リストから発送する商品を選びます。よく使う商品は事前登録がスムーズです。
                            </p>
                            <div className="bg-green-50 p-4 rounded-lg space-y-2 border border-green-100">
                                <h4 className="font-bold text-green-900 flex items-center gap-1">
                                    💡 専用エクセルから一括取り込み
                                </h4>
                                <p className="text-sm text-green-800">
                                    専用フォーマットをダウンロードしてアップロードすれば、数秒で大量の商品をマスタ化できます。
                                </p>
                            </div>
                        </section>

                        {/* 3. 発送依頼 */}
                        <section className="space-y-4">
                            <h3 className="text-xl font-bold flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
                                📝 3. サンプル発送依頼を作成する
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                「新規発送依頼」から手配を開始します。
                            </p>
                            <div className="bg-indigo-50 p-4 rounded-lg space-y-2 border border-indigo-100">
                                <h4 className="font-bold text-indigo-900 flex items-center gap-1">
                                    🎤 音声入力でハンズフリー作成
                                </h4>
                                <ol className="text-sm text-indigo-800 space-y-1 list-decimal list-inside">
                                    <li>「AIで自動入力」をON。</li>
                                    <li>マイクボタンを押して口頭で指示。</li>
                                    <li>「〇〇さんの佐藤さんに商品Aを2個」などと話す。</li>
                                    <li>録音を停止し「AIで解析」でフォームが自動で埋まります。</li>
                                </ol>
                            </div>
                            <div className="bg-indigo-50 p-4 rounded-lg space-y-2 border border-indigo-100">
                                <h4 className="font-bold text-indigo-900 flex items-center gap-1">
                                    💡 住所録から検索
                                </h4>
                                <p className="text-sm text-indigo-800">
                                    会社名や担当者名を入力すれば、過去の登録住所をすぐに呼び出せます。
                                </p>
                            </div>
                        </section>

                        {/* 4. メール */}
                        <section className="space-y-4">
                            <h3 className="text-xl font-bold flex items-center gap-2 border-l-4 border-orange-600 pl-3">
                                📧 4. メール送信と履歴管理
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                発送依頼（社内）、お知らせ（得意先）、フォローアップの3種類のメールを生成できます。
                            </p>
                            <div className="bg-orange-50 p-4 rounded-lg space-y-2 border border-orange-100">
                                <h4 className="font-bold text-orange-900 flex items-center gap-1">
                                    💡 自動BCC機能
                                </h4>
                                <p className="text-sm text-orange-800">
                                    すべてのメールに自分のアドレスがBCCで追加されるため、送信履歴が確実に手元に残ります。
                                </p>
                            </div>
                        </section>

                        {/* 5. PWA */}
                        <section className="space-y-4">
                            <h3 className="text-xl font-bold flex items-center gap-2 border-l-4 border-purple-600 pl-3">
                                📱 5. アプリとして使う (PWA)
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg border border-gray-100">
                                    <h4 className="font-bold text-gray-900 mb-2">Android (Chrome)</h4>
                                    <p className="text-sm text-gray-600">
                                        メニュー「︙」から「アプリをインストール」をタップ。
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg border border-gray-100">
                                    <h4 className="font-bold text-gray-900 mb-2">iPhone (Safari)</h4>
                                    <p className="text-sm text-gray-600">
                                        「共有ボタン」から「ホーム画面に追加」をタップ。
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
