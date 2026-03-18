export class ResponseDto {
  result: any | null = null;
  isSuccess = true;
  message = '';
  totalRecords = 0;
  pageNumber = 0;
  pageSize = 0;
  returnUrl?: string;
  naturalMessage?: string;

  constructor(init?: Partial<ResponseDto>) {
    Object.assign(this, init);
  }
}