function exportPNG() {
  if (!chartInstance) { showError('请先生成波形图。'); return; }

  // Chart.js 官方方法：内部会处理 devicePixelRatio，直接拿到含图表的 dataURL
  let chartDataURL;
  try {
    chartDataURL = chartInstance.toBase64Image('image/png', 1);
  } catch (e) {
    showError('获取图表图像失败：' + e.message);
    return;
  }

  // 用 Image 加载 chartDataURL 再合成到带标题的 canvas，确保尺寸正确
  const img = new Image();
  img.onload = () => {
    const pad = 24;
    const headerH = 56;
    const out = document.createElement('canvas');
    out.width = img.width + pad * 2;
    out.height = img.height + headerH + pad * 2;
    const ctx = out.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, out.width, out.height);

    ctx.fillStyle = '#222';
    ctx.font = '600 18px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText('DFM Touch — diff0 / diff1 / base0 / base1 四合一波形', pad, 34);

    ctx.fillStyle = '#666';
    ctx.font = '12px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(`生成时间: ${new Date().toLocaleString()}`, pad, 52);

    ctx.drawImage(img, pad, headerH);

    // 用 blob 方式下载，兼容性更好
    out.toBlob((blob) => {
      if (!blob) { showError('生成 PNG blob 失败。'); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dfm_touch_waveform_${Date.now()}.png`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      // 延迟释放，避免部分浏览器在下载启动前就 revoke 导致失败
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);
    }, 'image/png');
  };
  img.onerror = () => showError('图表图像加载失败（可能是图表未完全渲染）。');
  img.src = chartDataURL;
}