import { ChangePasswordForm } from "./ChangePasswordForm";

export default function AdminSettingsPage() {
  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-4">설정</h2>
      <ChangePasswordForm />
    </div>
  );
}
