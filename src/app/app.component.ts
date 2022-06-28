import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'angular-map';

  center: google.maps.LatLngLiteral = { lat: 80, lng: 12 };
  display: google.maps.LatLngLiteral = { lat: 24, lng: 12 };
  zoom = 4;
}
