import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MapPolygon } from '@angular/google-maps';

interface VerticesType {
  areaName: string;
  area: google.maps.LatLngLiteral[];
}

interface ComputeAreaOfPolygonType {
  areaName: string;
  area: google.maps.LatLngLiteral[];
  computedArea: number;
}

interface AreasType {
  areaName: string;
  computedArea: number;
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
  @ViewChild(MapPolygon)
  polygon!: MapPolygon;

  title = 'angular-map';
  center: google.maps.LatLngLiteral = { lat: 22.647652, lng: 90.367825 };
  zoom = 17;

  mapEditMode: string = '';
  totalAreaOfPolygon: number = 0;

  vertices: VerticesType[] = [];
  computeAreaOfPolygon: ComputeAreaOfPolygonType[] = [];

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
      clickable: false,
      editable: false,
    },
    B: {
      strokeColor: '#1a73e8',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#1a73e8',
      fillOpacity: 0.35,
      clickable: false,
      editable: false,
    },
    C: {
      strokeColor: 'green',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: 'green',
      fillOpacity: 0.35,
      clickable: false,
      editable: false,
    },
  };

  getOption(name: string) {
    return this.polygonOptions[name as keyof typeof this.polygonOptions];
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
      this.computeAreaOfPolygon.push({
        areaName: areaName,
        area: [],
        computedArea: 0,
      });
    }
  }

  click(event: google.maps.MapMouseEvent) {
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
        this.computeAreaOfPolygon[index] = {
          ...this.computeAreaOfPolygon[index],
          area: [...this.computeAreaOfPolygon[index]?.area, { lat, lng }],
        };
      }
    }

    this.computeArea();
  }

  editMode(name: string) {
    this.mapEditMode = name;
    for (let [key, value] of Object.entries(this.polygonOptions)) {
      if (key === name) {
        this.polygonOptions = {
          ...this.polygonOptions,
          [name]: {
            ...this.polygonOptions[name as keyof typeof this.polygonOptions],
            editable: true,
          },
        };
      } else {
        this.polygonOptions = {
          ...this.polygonOptions,
          [key]: {
            ...this.polygonOptions[key as keyof typeof this.polygonOptions],
            editable: false,
          },
        };
      }
    }
  }

  mouseMove(event: google.maps.MapMouseEvent) {
    const vertices = this.polygon.getPath();
    if (this.mapEditMode && this.vertices.length) {
      const index = this.vertices?.findIndex(
        (area) => area.areaName === this.mapEditMode
      );

      for (let i = 0; i < vertices.getLength(); i++) {
        if (index > -1) {
          const xy = vertices.getAt(i);
          this.computeAreaOfPolygon[index] = {
            ...this.computeAreaOfPolygon[index],
            area: [
              ...this.computeAreaOfPolygon[index]?.area,
              { lat: xy.lat(), lng: xy.lng() },
            ],
          };
        }
      }
    }

    this.computeArea();
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
    const computeIndex = this.computeAreaOfPolygon.findIndex(
      (area) => area.areaName === name
    );
    this.vertices.splice(index, 1);
    this.computeAreaOfPolygon.splice(computeIndex, 1);

    this.computeArea();
  }

  async computeArea() {
    for (let area of this.computeAreaOfPolygon) {
      const computedArea = await google.maps.geometry.spherical.computeArea(
        area.area
      );
      const index = this.computeAreaOfPolygon.findIndex(
        (area) => area.areaName === this.mapEditMode
      );

      if (index > -1 && this.mapEditMode) {
        this.computeAreaOfPolygon[index] = {
          ...this.computeAreaOfPolygon[index],
          areaName: this.mapEditMode,
          computedArea: computedArea,
        };
      }
    }

    const totalArea = this.computeAreaOfPolygon.reduce(
      (acc, curr) => acc + curr.computedArea,
      0
    );
    this.totalAreaOfPolygon = totalArea;
  }
}
