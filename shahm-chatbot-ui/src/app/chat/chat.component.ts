import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { lastValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid'; // Import uuidv4
import { environment } from '../../environments/environment';

// Define interfaces for the new JSON structure
export interface SmartButton {
  label: string;
  value: string;
  id: string; // Add unique identifier
  selected: boolean; // Add selected flag
}

export interface BotResponse {
  text: string;
  buttons?: SmartButton[]; // Buttons are optional
  fromMe?: boolean; // Add fromMe as an optional property
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers: [],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default

})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messageContainer') private messageContainer:
    | ElementRef
    | undefined;

  // Input to receive the bot's response
  // @Input() messages: BotResponse[] = []; // Renamed and changed type // REMOVED
  messages: BotResponse[] = []; // Re-introduce internal messages array
  newMessageText: string = '';
  private sessionId: string; // Add sessionId
  isLoading: boolean = false; // Add loading indicator flag
  inputValidationError: string | null = null;

  private readonly illegalInputPattern = /[{}\[\]<>`$%^&*|\\]/;

  constructor(private cdr: ChangeDetectorRef, private http: HttpClient) {
    this.sessionId = uuidv4(); // Initialize sessionId
  }

  ngOnInit(): void {
    this.sessionId = uuidv4();
    this.sendToWebhook('start conversation');
   }

  ngAfterViewChecked() {
    this.scrollToBottom();
    // this.cdr.detectChanges(); // REMOVED
  //  console.log(`ngafterviewchecked`);

  }

  /**
   * Handles sending a new message.
   */
  sendMessage(): void {
    const trimmedMessage = this.newMessageText.trim();
    if (trimmedMessage === '') {
      console.warn('Cannot send empty message');
      return;
    }

    if (this.containsIllegalCharacters(trimmedMessage)) {
      this.inputValidationError =
        'Message contains illegal characters such as {}, [], <, > or similar symbols.';
      return;
    }

    this.inputValidationError = null;

    this.messages.push({ text: trimmedMessage, fromMe: true, buttons: undefined });
    // this.onMessageSent.emit(trimmedMessage); // REMOVED
    this.newMessageText = ''; // Clear the input field
 // Manually trigger change detection
    this.scrollToBottom();
    this.cdr.detectChanges();
    this.isLoading = true; // Set loading to true
    this.sendToWebhook(trimmedMessage);
  }

  private async sendToWebhook(message: string, isSmartButton: boolean = false) {
    const webhookUrl = environment.webhookUrl;
    const payload = {
      chatInput: message,
      isSmartButton: isSmartButton,
      sessionId: this.sessionId, // Pass the sessionId to the webhook
    };

    try {
      this.isLoading = true;
          this.cdr.detectChanges();
      const response = await lastValueFrom(
        this.http.post<BotResponse>(webhookUrl, payload) // Cast response to BotResponse
      );
      // Ensure buttons array is initialized and add IDs and selected status
      if (response.buttons) {
        response.buttons = response.buttons.map(button => ({ ...button, id: uuidv4(), selected: false }));
      } else {
        response.buttons = []; // Ensure buttons array is always present
      }
      this.messages.push({ ...response, fromMe: false }); // Add bot response to messages
      this.isLoading = false; // Set loading to false on success
      this.cdr.detectChanges();
      this.scrollToBottom();
    } catch (error) {
      console.error('Error sending message to webhook:', error);
      this.messages.push({
        text: 'Oops! Something went wrong. Please try again.',
        fromMe: false,
        buttons: [],
      });

      this.isLoading = false; // S
      this.scrollToBottom();
      this.cdr.detectChanges();
    }


  }

  /**
   * Handles a smart button click.
   * @param button The SmartButton object that was clicked.
   */
  sendSmartButtonReply(button: SmartButton): void {
    // Find the message containing the clicked button and update its selected state
    this.messages.forEach(message => {
      if (message.buttons) {
        message.buttons.forEach(btn => {
          btn.selected = (btn.id === button.id);
        });
      }
    });

    this.messages.push({ text: button.label, fromMe: true, buttons: undefined });
    // this.onSmartButtonReply.emit(button); // REMOVED
    this.cdr.detectChanges(); // Manually trigger change detection
    this.scrollToBottom();
    this.isLoading = true; // Set loading to true
    this.sendToWebhook(button.value, true);
  }

  /**
   * Formats the message text to handle newlines and bold markdown.
   * @param text The raw message text.
   * @returns The formatted HTML string.
   */
  formatMessageText(text: string): string {
    if (!text) return '';
    // Replace newlines with <br> tags
    let formattedText = text.replace(/\n/g, '<br>');
    // Replace **text** with <strong>text</strong>
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return formattedText;
  }

  hasSelectedButton(buttons: SmartButton[] | undefined): boolean {
    return !!buttons && buttons.some(button => button.selected);
  }

  handleMessageInputChange(value: string): void {
    this.newMessageText = value;
    const trimmedValue = value.trim();
    if (trimmedValue === '') {
      this.inputValidationError = null;
      return;
    }

    this.inputValidationError = this.containsIllegalCharacters(trimmedValue)
      ? 'Message contains illegal characters such as {}, [], <, > or similar symbols.'
      : null;
  }

  private containsIllegalCharacters(value: string): boolean {
    return this.illegalInputPattern.test(value);
  }

  private scrollToBottom(): void {
    try {
      if (this.messageContainer?.nativeElement) {
        this.messageContainer.nativeElement.scrollTop =
          this.messageContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Could not scroll to bottom:', err);
    }
  }
}
