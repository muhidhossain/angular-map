import { Component } from '@angular/core';

interface VerticesType {
  areaName: string;
  area: google.maps.LatLngLiteral[];
}

interface PolygonOptionType {
  A: google.maps.PolygonOptions;
  B: google.maps.PolygonOptions;
  C: google.maps.PolygonOptions;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'angular-map';

  center: google.maps.LatLngLiteral = { lat: 22.647652, lng: 90.367825 };
  zoom = 17;
  mapEditMode: string = '';
  options: google.maps.MapOptions = {
    mapTypeId: 'hybrid',
    disableDoubleClickZoom: true,
  };
  polygonOptions: PolygonOptionType = {
    A: {
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      editable: false,
    },
    B: {
      strokeColor: '#1a73e8',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#1a73e8',
      fillOpacity: 0.35,
      editable: false,
    },
    C: {
      strokeColor: 'green',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: 'green',
      fillOpacity: 0.35,
      editable: false,
    },
  };

  vertices: VerticesType[] = [];

  click(event: google.maps.MapMouseEvent) {
    console.log(event.latLng?.lat());
    const lat = event.latLng?.lat() || 0;
    const lng = event.latLng?.lng() || 0;
    if (this.mapEditMode && this.vertices.length) {
      const index = this.vertices?.findIndex(
        (area) => area.areaName === this.mapEditMode
      );

      if (index > -1 && this.vertices[index].area.length < 3) {
        this.vertices[index] = {
          ...this.vertices[index],
          area: [...this.vertices[index]?.area, { lat, lng }],
        };
      }
    }
  }

  addNewArea() {
    const areaNames = ['A', 'B', 'C'];
    if (this.vertices.length < 3) {
      let areaName = '';
      for (let name of areaNames) {
        const area = this.vertices.find((area) => area.areaName === name);
        if (!area) {
          areaName = name;
          break;
        }
      }
      let options = this.polygonOptions;
      for (let [key, value] of Object.entries(this.polygonOptions)) {
        if (key === areaName) {
          options = { ...options, [key]: { ...value, editable: true } };
        } else {
          options = { ...options, [key]: { ...value, editable: false } };
        }
      }

      this.mapEditMode = areaName;
      this.polygonOptions = options;
      this.vertices.push({
        areaName: areaName,
        area: [],
      });
    }

    console.log(this.vertices);
  }

  editMode(name: string) {
    this.mapEditMode = name;
    this.polygonOptions = {
      ...this.polygonOptions,
      [name]: {
        ...this.polygonOptions[name as keyof typeof this.polygonOptions],
        editable: true,
      },
    };
  }

  done(name: string) {
    this.mapEditMode = '';
    this.polygonOptions = {
      ...this.polygonOptions,
      [name]: {
        ...this.polygonOptions[name as keyof typeof this.polygonOptions],
        editable: false,
      },
    };
  }

  delete(name: string) {
    const index = this.vertices.findIndex((area) => area.areaName === name);
    this.vertices.splice(index, 1);
  }

  getOption(name: string) {
    return this.polygonOptions[name as keyof typeof this.polygonOptions];
  }

  getPath(vertices: google.maps.LatLngLiteral[]) {
    console.log(vertices);
  }

  // computeArea(vertices: google.maps.LatLngLiteral[]) {
  //   const vertices =
  //   return google.maps.geometry.spherical.computeArea(vertices);
  // }
}
