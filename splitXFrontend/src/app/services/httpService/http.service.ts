import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private httpUri: string = 'http://localhost:5000';

  constructor(private http: HttpClient) {}
  originalRequest: any = {
    method: 'GET', // Default to 'GET' if method is undefined
    url: '',
    body: null,
    headers: this.getHeaders(), // Ensure to set headers with the new token after refresh
  };

  private getHeaders(callFrom?: string): HttpHeaders {
    if (callFrom === 'logout') {


      const token = localStorage.getItem('refresh-token');
      return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }
    const token = localStorage.getItem('access-token');
   

    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  private refreshToken(): Observable<any> {
    return this.http.post(
      `${this.httpUri}/api/user/refresh-token`,
      {},
      { withCredentials: true }
    );
  }

  private handleError(error: HttpErrorResponse): Observable<any> {
 

    if (error.status === 401) {
      return new Observable((observer) => {
        this.refreshToken().subscribe({
          next: (res) => {
            localStorage.setItem('access-token', res.accessToken);
            localStorage.setItem('refresh-token', res.refreshToken);

            // Retry the original request with the new token
            this.http
              .request(this.originalRequest.method, this.originalRequest.url, {
                headers: this.getHeaders(),
                body: this.originalRequest.body,
              })
              .subscribe({
                next: (retryRes) => observer.next(retryRes),
                error: (retryError) => observer.error(retryError),
                complete: () => observer.complete(),
              });
          },
          error: (refreshError) => {
            this.logoutUser();
            observer.error(refreshError);
          },
        });
      });
    }

    return throwError(() => error);
  }

  private logoutUser(): void {
    localStorage.removeItem('access-token');
    localStorage.removeItem('refresh-token');
    window.location.href = '/login';
  }

  post(url: string, data: any, callFrom?: string): Observable<any> {
 

    return this.http.post(`${this.httpUri}/${url}`, data, {
      headers: this.getHeaders(callFrom),
      withCredentials: true,
    });
  }

  securedPost(url: string, data: any = {}): Observable<any> {
    return new Observable((observer) => {
      this.originalRequest = {
        method: 'POST',
        body: data,
        url: `${this.httpUri}/${url}`,
      };
      this.http
        .post(`${this.httpUri}/${url}`, data, {
          headers: this.getHeaders(),
          withCredentials: true,
        })
        .subscribe({
          next: (res) => observer.next(res),
          error: (err) => {
            this.handleError(err).subscribe(observer);
          },
          complete: () => observer.complete(),
        });
    });
  }
  securedGet(url: string, data: any = {}): Observable<any> {
    return new Observable((observer) => {
      this.originalRequest = {
        method: 'GET',
        url: `${this.httpUri}/${url}`,
      };
      this.http
        .get(`${this.httpUri}/${url}`, {
          headers: this.getHeaders(),
          withCredentials: true,
        })
        .subscribe({
          next: (res) => {
            

            observer.next(res);
          },
          error: (err) => {
            this.handleError(err).subscribe(observer);
           
          },
          complete: () => observer.complete(),
        });
    });
  }
  securedPatch(url: string, data: any = {}): Observable<any> {
    return new Observable((observer) => {
      this.originalRequest = {
        method: 'PATCH',
        body: data,
        url: `${this.httpUri}/${url}`,
      };
      this.http
        .patch(`${this.httpUri}/${url}`, data, {
          headers: this.getHeaders(),
          withCredentials: true,
        })
        .subscribe({
          next: (res) => observer.next(res),
          error: (err) => {
            this.handleError(err).subscribe(observer);
          },
          complete: () => observer.complete(),
        });
    });
  }
  securedDelete(url: string, data: any = {}): Observable<any> {
    return new Observable((observer) => {
      this.originalRequest = {
        method: 'DELETE',
        body: data,
        url: `${this.httpUri}/${url}`,
      };
      this.http
        .delete(`${this.httpUri}/${url}`, {
          headers: this.getHeaders(),
          withCredentials: true,
        })
        .subscribe({
          next: (res) => observer.next(res),
          error: (err) => {
            this.handleError(err).subscribe(observer);
          },
          complete: () => observer.complete(),
        });
    });
  }
}
