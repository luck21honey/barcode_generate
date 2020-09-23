import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from './common.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'client';
  uploadFlag: Boolean = false;
  generateFlag: Boolean = true;
  generateSpinner: Boolean = false;
  downloadFlag: Boolean = false;
  downloadSpinner: Boolean = false;
  downloadURL: string = environment.API_URL + '/download';

  constructor(private toastr: ToastrService, private service: CommonService) { }

  uploadFile(files: FileList) {
    if (files && files.length > 0) {
      let file: File = files.item(0);
      let fileReader: FileReader = new FileReader();
      fileReader.readAsText(file);
      fileReader.onload = ev => {
        let csvdata = fileReader.result.toString();
        let body = { data: csvdata };

        this.uploadFlag = true;
        this.service.fileUpload(body)
          .subscribe(data => {
            this.uploadFlag = false;
            this.generateFlag = false;

            if (data.error_code) {
              this.toastr.error(data.err_desc, "Oops",);
              return;
            }

            this.toastr.success(data.message, "Success");
          });
      };
    }
  }


  generate() {
    this.generateSpinner = true;
    this.service.generate()
      .subscribe(data => {
        this.generateSpinner = false;
        this.generateFlag = false;

        if (data.error_code) {
          this.toastr.error(data.err_desc, "Oops",);
          return;
        }

        this.downloadFlag = true;
        this.toastr.success(data.message, "Success",);
      });
  }

  download() {
    this.generateFlag = false;
    this.downloadFlag = false;
  }

}
