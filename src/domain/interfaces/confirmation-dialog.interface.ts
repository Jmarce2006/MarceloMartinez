export interface IConfirmationDialog {
  isOpen: boolean;
  title: string;
  onConfirm(): void;
  onCancel(): void;
} 