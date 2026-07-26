import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const base = Swal.mixin({
  confirmButtonColor: '#1b5e20',
  cancelButtonColor: '#6b7280',
  buttonsStyling: true,
});

export async function swalSuccess(title: string, text?: string) {
  return base.fire({
    icon: 'success',
    title,
    text,
    timer: 2200,
    showConfirmButton: true,
  });
}

export async function swalError(title: string, text?: string) {
  return base.fire({
    icon: 'error',
    title,
    text: text || 'Something went wrong. Please try again.',
  });
}

export async function swalConfirm(title: string, text?: string) {
  const result = await base.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'Cancel',
  });
  return result.isConfirmed;
}

/** Indeterminate-style progress dialog used during admin login. */
export function openLoginProgress() {
  void base.fire({
    title: 'Signing in…',
    html: `
      <p style="margin:0 0 14px;color:#4a5c4f;font-size:14px">Authenticating and loading admin data</p>
      <div class="swal-login-track" aria-hidden="true">
        <div class="swal-login-bar" id="swal-login-bar"></div>
      </div>
      <p id="swal-login-status" style="margin:12px 0 0;color:#4a5c4f;font-size:13px">Checking credentials…</p>
    `,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      const bar = document.getElementById('swal-login-bar');
      if (bar) bar.style.width = '18%';
    },
  });
}

export function setLoginProgress(percent: number, status: string) {
  const bar = document.getElementById('swal-login-bar');
  const label = document.getElementById('swal-login-status');
  if (bar) bar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  if (label) label.textContent = status;
}

export function closeLoginProgress() {
  Swal.close();
}
