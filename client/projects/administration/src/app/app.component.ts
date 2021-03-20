import { Component } from '@angular/core';

const url = "https://anhdep123.com/wp-content/uploads/2021/02/anh-gai-trung-quoc-dep.jpg";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'administration';

  data = [
    { id: 1, name: "Phạm Quốc Cường", age: 24, avatar: url },
    { id: 2, name: "Quốc Cường Phạm", age: 21, avatar: url },
    { id: 3, name: "Phạm Quốc Cường", age: 24, avatar: url },
    { id: 4, name: "Quốc Cường Phạm", age: 21, avatar: url },
    { id: 5, name: "Phạm Quốc Cường", age: 24, avatar: url },
    { id: 6, name: "Quốc Cường Phạm", age: 21, avatar: url },
    { id: 7, name: "Phạm Quốc Cường", age: 24, avatar: url },
    { id: 8, name: "Quốc Cường Phạm", age: 21, avatar: url },
    { id: 9, name: "Phạm Quốc Cường", age: 24, avatar: url },
    { id: 10, name: "Quốc Cường Phạm", age: 21, avatar: url },
    { id: 11, name: "Phạm Quốc Cường", age: 24, avatar: url },
    { id: 12, name: "Quốc Cường Phạm", age: 21, avatar: url },
    { id: 13, name: "Phạm Quốc Cường", age: 24, avatar: url },
    { id: 14, name: "Quốc Cường Phạm", age: 21, avatar: url },
    { id: 15, name: "Phạm Quốc Cường", age: 24, avatar: url },
    { id: 16, name: "Quốc Cường Phạm", age: 21, avatar: url }
  ];

  onSort(value) {
    alert(JSON.stringify(value));
  }

  onPageChange(value) {}
}
