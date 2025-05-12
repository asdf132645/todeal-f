// ~/composables/useToast.ts
export function useToast() {
    const showToast = (message: string, color = 'warning') => {
        const toast = document.createElement('div')
        toast.textContent = message
        toast.style.cssText = `
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      background: ${color === 'warning' ? '#ffc107' : '#323232'};
      color: black;
      padding: 10px 16px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.3s ease;
    `
        document.body.appendChild(toast)
        requestAnimationFrame(() => {
            toast.style.opacity = '1'
        })
        setTimeout(() => {
            toast.style.opacity = '0'
            setTimeout(() => document.body.removeChild(toast), 300)
        }, 2000)
    }

    return { showToast }
}
