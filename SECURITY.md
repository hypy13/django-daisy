# Security Policy

Thank you for helping us keep django-daisy secure for everyone! This document outlines the security policies for reporting vulnerabilities and handling security issues.

## Supported Versions

The following versions of django-daisy receive security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | ✅ Yes             |
| 0.x.x   | ❌ No              |

We recommend that all users keep their versions up-to-date to benefit from the latest security fixes.

## Reporting a Vulnerability

If you discover a security vulnerability, please do **not** submit an issue or pull request directly to the repository, as this could expose the vulnerability publicly. Instead, please follow these steps:

1. **Email us at [hossein.yaghoubi13@gmail.com]**: Use this email to report any vulnerabilities privately.
2. **Include Details**: Provide as much detail as possible, including steps to reproduce the issue, potential impact, and any relevant code or configurations.
3. **Expected Response Time**: We aim to respond within 3 business days and provide an update on the status within a week of the initial report.

## Disclosure Policy

- After addressing a vulnerability, we will coordinate with the reporter on a responsible disclosure timeline.
- Vulnerabilities will be disclosed publicly only after a patch has been released.

## Security Best Practices for Contributors

When contributing to django-daisy, please keep these security practices in mind:
- Avoid introducing any third-party libraries without verifying their security status.
- Ensure that all user inputs are properly validated and sanitized.
- Test for common security vulnerabilities, including XSS, CSRF, and SQL Injection.

Thank you for helping make django-daisy safe and secure!
