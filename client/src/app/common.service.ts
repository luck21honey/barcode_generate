import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from "@angular/common/http"
import { Observable } from 'rxjs';
import { environment } from '../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  API_URL: string = environment.API_URL;

  constructor(private http: HttpClient) { }

  fileUpload(body: any): Observable<any> {
    return this.http.post<any>(
      this.API_URL + "/upload",
      body
    );
  }

  generate(): Observable<any> {
    return this.http.get<any>(
      this.API_URL + "/generate"
    )
  }

  test(): Observable<any> {
    return this.http.get<any>(
      this.API_URL + "/test"
    )
  }

}
