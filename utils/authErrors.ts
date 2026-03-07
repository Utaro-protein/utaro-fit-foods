/**
 * Supabase 認証エラーメッセージを日本語に変換
 */
export function getAuthErrorMessage(enMessage: string): string {
  const messages: Record<string, string> = {
    "Invalid login credentials":
      "メールアドレスまたはパスワードが正しくありません。",
    "Email not confirmed": "メールアドレスの確認が完了していません。",
    "User already registered": "このメールアドレスはすでに登録されています。",
    "A user with this email already exists":
      "このメールアドレスはすでに登録されています。",
    "Password should be at least 6 characters":
      "パスワードは6文字以上にしてください。",
    "Unable to validate email address: invalid format":
      "メールアドレスの形式が正しくありません。",
    "Signup requires a valid password":
      "有効なパスワードを入力してください。",
    "Email rate limit exceeded":
      "送信回数の上限に達しました。しばらく待ってからお試しください。",
    "Forbidden": "この操作は許可されていません。",
    "New password should be different from the old password.":
      "新しいパスワードは現在のパスワードと異なるものを設定してください。",
  };
  return messages[enMessage] ?? "エラーが発生しました。しばらく経ってからお試しください。";
}
