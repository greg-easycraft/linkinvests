type OperationSuccess<T> = {
  success: true;
  data: T;
};

type OperationFailure<R> = {
  success: false;
  reason: R;
};

export type OperationResult<T, E> = OperationSuccess<T> | OperationFailure<E>;

export function succeed<T>(data: T): OperationSuccess<T> {
  return { success: true, data };
}

export function refuse<E>(reason: E): OperationFailure<E> {
  return { success: false, reason };
}

export function isSuccess<T, E>(
  result: OperationResult<T, E>,
): result is OperationSuccess<T> {
  return result.success;
}

export function isRefusal<T, E>(
  result: OperationResult<T, E>,
): result is OperationFailure<E> {
  return !result.success;
}
