import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IConfirmationDialog } from '../../../../domain/interfaces/confirmation-dialog.interface';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ConfirmationModalComponent implements IConfirmationDialog {
  @Input() isOpen = false;
  @Input() title = '';
  @Output() private readonly confirmEvent = new EventEmitter<void>();
  @Output() private readonly cancelEvent = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmEvent.emit();
  }

  onCancel(): void {
    this.cancelEvent.emit();
  }
} 