// Explicit business and platform governance rule messages
const RULE_VIOLATION_MESSAGES = {
  DATA_INTEGRITY_VIOLATION:
    'Cannot delete: Linked to existing orders. Deactivate instead.',
  INVENTORY_QUANTITY_LESS_THAN_RESERVED:
    'Inventory Rule Violation: The requested stock deduction cannot be applied because the remaining quantity would be less than the stock reserved for pending customer orders.',
  INVENTORY_INSUFFICIENT_STOCK:
    'Inventory Rule Violation: Insufficient physical stock available to complete this deduction.',
  INSUFFICIENT_STOCK:
    'Inventory Rule Violation: Insufficient physical stock available for the requested operation.',
  ORDER_INVALID_STATUS_TRANSITION:
    'Invalid status transition: Not permitted for this order.',
  ORDER_ACCESS_DENIED:
    'Governance Rule: You do not have administrative permission to modify this order.',
  ADMIN_USER_ALREADY_ACTIVE:
    'Governance Rule: This user account is already active.',
  ADMIN_USER_ALREADY_INACTIVE:
    'Governance Rule: This user account is already deactivated.',
  ADMIN_USER_ALREADY_LOCKED:
    'Security Rule: This user account is already locked.',
  ADMIN_USER_ALREADY_UNLOCKED:
    'Security Rule: This user account is already unlocked.',
  PRODUCT_IMAGE_DELETE_FAILED:
    'Catalog Rule Violation: Cannot delete product image. Listings must maintain at least one valid produce photo.',
  INVALID_PRODUCT_STATUS:
    'Catalog Rule Violation: Invalid product status specified.',
  PAYMENT_REFUND_NOT_ALLOWED:
    'Financial Policy Rule: A refund cannot be initiated for this payment under its current transaction status.',
  DELIVERY_OTP_ALREADY_VERIFIED:
    'Delivery Rule Violation: The delivery OTP for this consignment has already been verified.',
  DELIVERY_OTP_EXPIRED:
    'Delivery Rule Violation: The delivery OTP has expired. Please generate a new OTP.',
  DELIVERY_OTP_INVALID:
    'Security Rule Violation: The entered delivery OTP is incorrect.',
  ACCESS_DENIED:
    'Access Denied: You do not have permission to execute this administrative operation.',
};

/**
 * Normalizes backend error responses into a standardized structure.
 * Backend Error Schema: { code: string, message: string, validationErrors?: [{ field, code, message }] }
 */
export function normalizeApiError(error) {
  if (!error) {
    return {
      message: 'An unexpected error occurred. Please try again.',
      code: 'UNKNOWN_ERROR',
      status: 0,
      validationErrors: {},
    };
  }

  // If already normalized or custom object with message, preserve it directly
  if (error.message && error.code && !error.response && error.code !== 'NETWORK_ERROR') {
    return error;
  }

  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        message: 'Request timed out. Please verify your connection and try again.',
        code: 'TIMEOUT_ERROR',
        status: 408,
        validationErrors: {},
      };
    }
    return {
      message: 'Unable to connect to AgriMarket servers. Please check your internet connection.',
      code: 'NETWORK_ERROR',
      status: 0,
      validationErrors: {},
    };
  }

  const { status, data } = error.response;
  const rawCode = data?.code || 'UNKNOWN_ERROR';
  let message = data?.message || 'An unexpected error occurred. Please try again.';

  // Map validation errors by field for instant form highlighting
  const validationErrors = {};
  if (Array.isArray(data?.validationErrors)) {
    data.validationErrors.forEach((err) => {
      if (err.field) {
        validationErrors[err.field] = err.message || err.code;
      }
    });
  }

  // Check known rule violation codes first for clear administrative feedback
  if (RULE_VIOLATION_MESSAGES[rawCode]) {
    message = RULE_VIOLATION_MESSAGES[rawCode];
  } else {
    // Friendly messages for common HTTP and business codes
    switch (status) {
      case 400:
        if (Array.isArray(data?.validationErrors) && data.validationErrors.length > 0) {
          const firstValidation = data.validationErrors.find((v) => v.message)?.message;
          if (firstValidation) {
            message = `Validation Rule: ${firstValidation}`;
          }
        } else if (!message || message === 'Request body is invalid or malformed') {
          message = 'Invalid request. Please check the entered information.';
        }
        break;
      case 401:
        if (rawCode === 'BAD_CREDENTIALS') {
          message = 'Invalid email or password. Please try again.';
        } else if (rawCode === 'ERR_USER_DISABLED') {
          message = data?.message || 'Your account is disabled or pending verification. Please check your email to activate your account.';
        } else if (rawCode === 'PERMANENT_ACCOUNT_LOCKED') {
          message = data?.message || 'Your account is permanently locked due to too many failed login attempts. Please contact support.';
        } else if (rawCode === 'PASSWORD_LOGIN_NOT_AVAILABLE') {
          message = data?.message || 'Password login is not available for this account. Please sign in with OAuth.';
        } else if (data?.message && !data.message.toLowerCase().includes('unauthorized')) {
          message = data.message;
        } else {
          message = 'Your session has expired. Please sign in again to continue.';
        }
        break;
      case 403:
        message = 'Governance Rule: You do not have permission to perform this action.';
        break;
      case 404:
        message = data?.message || 'The requested resource was not found.';
        break;
      case 409:
        if (
          rawCode === 'DATA_INTEGRITY_VIOLATION' ||
          message?.toLowerCase().includes('data constraint') ||
          message?.toLowerCase().includes('could not be completed')
        ) {
          message = 'Cannot delete: Linked to existing orders. Deactivate instead.';
        } else {
          message = data?.message || 'A conflicting record already exists.';
        }
        break;
      case 429:
        message = 'Too many requests. Please wait a moment before trying again.';
        break;
      case 500:
      case 502:
      case 503:
        message = 'Server is currently experiencing technical issues. Please try again shortly.';
        break;
      default:
        break;
    }
  }

  return {
    message,
    code: rawCode,
    status,
    validationErrors,
    raw: data,
  };
}
