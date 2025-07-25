/**
 * Comprehensive input validation utilities for security hardening
 */

// Email validation with enhanced security checks
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }

  // Length check to prevent DoS
  if (email.length > 254) {
    return { isValid: false, error: 'Email too long' };
  }

  // Enhanced regex for email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  // Check for dangerous characters
  const dangerousChars = /<|>|"|'|&|javascript:|data:|vbscript:/i;
  if (dangerousChars.test(email)) {
    return { isValid: false, error: 'Email contains invalid characters' };
  }

  return { isValid: true };
};

// Password validation with security requirements
export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Password too long' };
  }

  // Check for at least one uppercase, lowercase, number, and special character
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    return { 
      isValid: false, 
      error: 'Password must contain uppercase, lowercase, number, and special character' 
    };
  }

  return { isValid: true };
};

// Generic text input sanitization
export const sanitizeTextInput = (input: string, maxLength: number = 1000): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Trim and limit length
  let sanitized = input.trim().substring(0, maxLength);

  // Remove dangerous characters and patterns
  sanitized = sanitized
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '');

  return sanitized;
};

// Validate JSON input with size limits
export const validateJsonInput = (input: string): { isValid: boolean; parsed?: any; error?: string } => {
  if (!input || typeof input !== 'string') {
    return { isValid: false, error: 'Invalid JSON input' };
  }

  // Size limit to prevent DoS
  if (input.length > 50000) {
    return { isValid: false, error: 'JSON input too large' };
  }

  try {
    const parsed = JSON.parse(input);
    
    // Check for dangerous properties
    const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
    const hasDangerousKeys = JSON.stringify(parsed).toLowerCase().includes(dangerousKeys.join('|'));
    
    if (hasDangerousKeys) {
      return { isValid: false, error: 'JSON contains dangerous properties' };
    }

    return { isValid: true, parsed };
  } catch (error) {
    return { isValid: false, error: 'Invalid JSON format' };
  }
};

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (
  identifier: string, 
  maxAttempts: number = 5, 
  windowMs: number = 300000 // 5 minutes
): { allowed: boolean; remaining: number; resetTime: number } => {
  const now = Date.now();
  const key = identifier;
  
  const current = rateLimitMap.get(key);
  
  if (!current || now > current.resetTime) {
    // Reset or initialize
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, resetTime: now + windowMs };
  }
  
  if (current.count >= maxAttempts) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime };
  }
  
  current.count++;
  return { 
    allowed: true, 
    remaining: maxAttempts - current.count, 
    resetTime: current.resetTime 
  };
};

// Content Security Policy validation for user uploads
export const validateUploadSecurity = (file: File): { isValid: boolean; error?: string } => {
  // File size limit (10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { isValid: false, error: 'File too large' };
  }

  // Allowed MIME types
  const allowedTypes = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'text/plain',
    'application/pdf'
  ];

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File type not allowed' };
  }

  // Check file extension matches MIME type
  const extension = file.name.split('.').pop()?.toLowerCase();
  const mimeExtensionMap: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
    'text/plain': ['txt'],
    'application/pdf': ['pdf']
  };

  const expectedExtensions = mimeExtensionMap[file.type];
  if (!expectedExtensions || !extension || !expectedExtensions.includes(extension)) {
    return { isValid: false, error: 'File extension does not match content type' };
  }

  return { isValid: true };
};