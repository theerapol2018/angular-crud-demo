import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, retry, throwError } from 'rxjs';

import { API_BASE_URL } from '../../../core/config/api-base-url.token';
import { Product, ProductCreate, ProductUpdate } from '../models/product.model';

export type ApiErrorKind = 'network' | 'notFound' | 'conflict' | 'validation' | 'auth' | 'unknown';

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly kind: ApiErrorKind,
    readonly status?: number,
  ) {
    super(message);
  }
}

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly productsUrl = `${this.apiBaseUrl}/products`;

  list(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl).pipe(
      retry({ count: 2, delay: 300 }),
      catchError((error) => this.handleError(error)),
    );
  }

  get(id: string): Observable<Product> {
    return this.http
      .get<Product>(`${this.productsUrl}/${id}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  create(payload: ProductCreate): Observable<Product> {
    return this.http
      .post<Product>(this.productsUrl, payload)
      .pipe(catchError((error) => this.handleError(error)));
  }

  update(id: string, payload: ProductUpdate): Observable<Product> {
    return this.http
      .put<Product>(`${this.productsUrl}/${id}`, payload)
      .pipe(catchError((error) => this.handleError(error)));
  }

  remove(id: string): Observable<void> {
    return this.http.delete(`${this.productsUrl}/${id}`).pipe(
      map(() => undefined),
      catchError((error) => this.handleError(error)),
    );
  }

  private handleError(error: unknown): Observable<never> {
    if (!(error instanceof HttpErrorResponse)) {
      return throwError(() => new ApiRequestError('Unexpected error.', 'unknown'));
    }

    if (error.status === 0) {
      return throwError(() => new ApiRequestError('Cannot connect to server.', 'network', 0));
    }

    if (error.status === 401 || error.status === 403) {
      return throwError(
        () =>
          new ApiRequestError('You are not allowed to perform this action.', 'auth', error.status),
      );
    }

    if (error.status === 404) {
      return throwError(() => new ApiRequestError('Product not found.', 'notFound', 404));
    }

    if (error.status === 409) {
      return throwError(
        () => new ApiRequestError('Data was changed by someone else.', 'conflict', 409),
      );
    }

    if (error.status === 400 || error.status === 422) {
      return throwError(
        () =>
          new ApiRequestError(
            this.errorMessage(error) ?? 'Please check the form.',
            'validation',
            error.status,
          ),
      );
    }

    return throwError(
      () =>
        new ApiRequestError(
          this.errorMessage(error) ?? `Request failed with status ${error.status}.`,
          'unknown',
          error.status,
        ),
    );
  }

  private errorMessage(error: HttpErrorResponse): string | null {
    const body = error.error;

    if (!body || typeof body !== 'object') {
      return null;
    }

    const message = (body as { message?: unknown }).message;

    return typeof message === 'string' && message.trim() ? message : null;
  }
}
