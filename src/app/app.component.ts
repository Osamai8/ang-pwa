import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { SwUpdate } from '@angular/service-worker';
import { NetworkService } from './services/network.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ang-pwa';
  isOnline$!: Observable<boolean>;
  constructor(private swUpdate: SwUpdate, private networkService: NetworkService) {

  }
  ngOnInit() {
    this.networkService.init();
    this.isOnline$ = this.networkService.isOnline$;
    this.requestNotificationPermission();
    this.checkForUpdates();
  }

  private requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  private checkForUpdates(): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe(event => {
        if (event.type === 'VERSION_READY') {
          if (confirm('New version available. Load now?')) {
            window.location.reload();
          }
        }
      });
    }
  }
}
