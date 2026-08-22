'use client';

import { useEffect, useRef, useState } from 'react';

type WatchState = 'idle' | 'listen' | 'think' | 'reply' | 'control' | 'confirm' | 'offline';

const demoStates: Array<{ id: WatchState; label: string }> = [
  { id: 'idle', label: '待命' },
  { id: 'listen', label: '聆聽' },
  { id: 'think', label: '理解' },
  { id: 'reply', label: '回覆' },
  { id: 'control', label: '控制' },
  { id: 'confirm', label: '核准' },
  { id: 'offline', label: '離線' },
];

const featureGroups = [
  { no: '01', eyebrow: 'REALTIME VOICE', title: '像對話，不像下指令', text: '自然停頓判斷、低延遲回覆與隨時打斷。回答與字幕逐句同步，不再讓使用者等完整段落。' },
  { no: '02', eyebrow: 'AGENT ACTIONS', title: '從回答走向行動', text: '查天氣、行情與網路資訊，也能調整音量、拍照、管理連線。敏感操作一定在腕上再次核准。' },
  { no: '03', eyebrow: 'PERSONAL MEMORY', title: '認得人，也記得重要的事', text: '以聲音辨識不同使用者，只保存經過篩選的長期記憶，讓每次對話延續而不失去界線。' },
];

function FlowField({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flow-field${compact ? ' flow-field--compact' : ''}`} aria-hidden="true">
      <span className="flow-track flow-track-a" />
      <span className="flow-track flow-track-b" />
      <span className="flow-track flow-track-c" />
      <i className="flow-node flow-node-a" />
      <i className="flow-node flow-node-b" />
      <i className="flow-node flow-node-c" />
    </div>
  );
}

function SignalBars() {
  return <div className="signal-bars" aria-hidden="true">{Array.from({ length: 19 }, (_, index) => <i key={index} style={{ '--bar': index } as React.CSSProperties} />)}</div>;
}

function WatchDemo() {
  const [state, setState] = useState<WatchState>('idle');
  const [volume, setVolume] = useState(72);
  const [clock, setClock] = useState('23:58');
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const updateClock = () => setClock(new Intl.DateTimeFormat('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()));
    updateClock();
    const timer = window.setInterval(updateClock, 15000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const selectState = (next: WatchState) => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setState(next);
  };
  const runConversation = () => {
    selectState('listen');
    timers.current = [window.setTimeout(() => setState('think'), 2200), window.setTimeout(() => setState('reply'), 4000)];
  };

  return (
    <div className="demo-shell">
      <div className="demo-toolbar" aria-label="切換手錶狀態">
        {demoStates.map((item) => <button type="button" key={item.id} aria-pressed={state === item.id} onClick={() => selectState(item.id)}>{item.label}</button>)}
      </div>
      <div className="watch-frame">
        <div className="watch-screen" data-state={state}>
          <button className="watch-grab" type="button" onClick={() => selectState('control')} aria-label="開啟控制中心"><span /></button>
          <div className="watch-status"><span className="wifi-status"><i />已連線</span><span>94%</span></div>

          <section className="watch-panel panel-idle" aria-hidden={state !== 'idle'}>
            <p className="watch-time">{clock}</p>
            <div className="watch-date"><span>8月22日　星期六</span><small>農曆七月初十</small></div>
            <FlowField />
            <button type="button" className="watch-primary" onClick={runConversation}><i />輕觸開始說話</button>
            <button type="button" className="watch-hint" onClick={() => selectState('control')}>下滑控制</button>
          </section>

          <section className="watch-panel panel-listen" aria-hidden={state !== 'listen'}>
            <div className="mode-header"><div><span>我在聽</span><small>說完後會自動回應</small></div><em>麥克風使用中</em></div>
            <SignalBars />
            <button type="button" className="watch-secondary" onClick={() => selectState('think')}>完成</button>
          </section>

          <section className="watch-panel panel-think" aria-hidden={state !== 'think'}>
            <div className="mode-header"><div><span>正在理解</span><small>可以隨時打斷我</small></div></div>
            <FlowField compact />
            <p className="thought">把聲音、上下文與可用工具整理成下一步。</p>
            <button type="button" className="watch-secondary" onClick={runConversation}>打斷並說話</button>
          </section>

          <section className="watch-panel panel-reply" aria-hidden={state !== 'reply'}>
            <div className="mode-header"><div><span>回覆中</span><small>語音與字幕同步</small></div></div>
            <div className="caption-card"><span>現在東京是晴天，氣溫 27 度。</span><small>1 / 2</small><i /></div>
            <button type="button" className="watch-secondary" onClick={runConversation}>輕觸打斷</button>
          </section>

          <section className="watch-panel sheet panel-control" aria-hidden={state !== 'control'}>
            <div className="sheet-head"><strong>控制中心</strong><button type="button" onClick={() => selectState('idle')}>完成</button></div>
            <div className="device-row"><span>日本 Gateway</span><span>電量 94%</span></div>
            <div className="volume-control">
              <button type="button" onClick={() => setVolume((value) => Math.max(0, value - 8))} aria-label="降低音量">−</button>
              <div><strong>{volume}</strong><small>音量</small></div>
              <button type="button" onClick={() => setVolume((value) => Math.min(100, value + 8))} aria-label="提高音量">＋</button>
            </div>
            <div className="network-setting"><span><strong>Wi-Fi</strong><small>Studio 5G · 已連線</small></span><button type="button" onClick={() => selectState('offline')}>管理</button></div>
            <button type="button" className="restart-action" onClick={() => selectState('confirm')}>重新啟動手錶</button>
          </section>

          <section className="watch-panel sheet panel-confirm" aria-hidden={state !== 'confirm'}>
            <div className="system-mark" /><h3>確認重新啟動？</h3><p>對話將暫停約 20 秒。Wi-Fi、記憶與個人設定都會保留。</p><span className="countdown">未操作將自動取消</span>
            <div className="confirm-actions"><button type="button" onClick={() => selectState('control')}>取消</button><button type="button" onClick={() => selectState('idle')}>確認重啟</button></div>
          </section>

          <section className="watch-panel sheet panel-offline" aria-hidden={state !== 'offline'}>
            <div className="system-mark" /><h3>正在找回連線</h3><p>依序嘗試已儲存的 Wi-Fi。失敗時可直接加入附近的新網路。</p><div className="search-line"><i /></div>
            <div className="confirm-actions"><button type="button" onClick={() => selectState('idle')}>稍後再試</button><button type="button" onClick={() => selectState('control')}>新增 Wi-Fi</button></div>
          </section>
        </div>
      </div>
      <p className="demo-note"><span />可操作展示 · 點選狀態或輕觸錶面</p>
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <nav className="site-nav" aria-label="主要導覽">
        <a className="wordmark" href="#top" aria-label="Lumen 首頁"><i />LUMEN</a>
        <div className="nav-links"><a href="#experience">體驗</a><a href="#capabilities">能力</a><a href="#architecture">架構</a></div>
        <a className="nav-cta" href="#vision">產品願景</a>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="kicker"><span /> ON-DEVICE AGENT</p>
          <h1>把真正能做事的<br /><em>智慧</em>，戴在手上。</h1>
          <p className="hero-lede">自然對話、即時資訊、裝置控制與個人記憶。以一個溫暖安靜的介面，讓 ESP32 手錶成為隨身的行動 Agent。</p>
          <div className="hero-actions"><a className="primary-link" href="#experience">親自操作體驗 <span>↘</span></a><a className="text-link" href="#architecture">了解運作方式</a></div>
          <dl className="hero-facts"><div><dt>REALTIME</dt><dd>可打斷語音互動</dd></div><div><dt>MULTI-REGION</dt><dd>跨區 Gateway</dd></div><div><dt>ESP32-S3</dt><dd>低功耗終端</dd></div></dl>
        </div>
        <div className="hero-demo" id="experience"><div className="ambient-ring" aria-hidden="true" /><WatchDemo /></div>
      </section>

      <section className="manifesto section-pad" id="capabilities">
        <div className="section-index">01 / 能力</div>
        <div className="manifesto-head"><p>不是把手機縮小，<br />而是重新思考人與智慧的距離。</p><span>少一點介面，多一點理解。重要資訊一眼看見，複雜工作由 Gateway 在背後完成。</span></div>
        <div className="feature-list">{featureGroups.map((feature) => <article key={feature.no}><span className="feature-no">{feature.no}</span><div><small>{feature.eyebrow}</small><h2>{feature.title}</h2></div><p>{feature.text}</p></article>)}</div>
      </section>

      <section className="architecture section-pad" id="architecture">
        <div className="section-index">02 / 架構</div>
        <div className="architecture-grid">
          <div className="architecture-copy"><p className="kicker"><span /> GLOBAL BY DESIGN</p><h2>輕巧的手錶，<br />可靠的雲端能力。</h2><p>ESP32 專注收音、顯示與安全控制；日本與香港 Gateway 負責串流、工具協調與模型切換。即使電腦關機，也能獨立使用。</p></div>
          <div className="system-map" role="img" aria-label="手錶、Gateway、模型與工具的連線架構">
            <div className="map-node map-watch"><small>EDGE</small><strong>Lumen Watch</strong><span>語音 · 觸控 · 感測</span></div>
            <div className="map-rail"><i /><span>低延遲串流</span><i /></div>
            <div className="map-node map-gateway"><small>REGIONAL</small><strong>Agent Gateway</strong><span>Tokyo · Hong Kong</span></div>
            <div className="map-branches" />
            <div className="map-tools"><span>模型</span><span>即時查詢</span><span>個人記憶</span></div>
          </div>
        </div>
      </section>

      <section className="trust section-pad">
        <div className="section-index">03 / 信任</div>
        <div className="trust-layout"><h2>能力越完整，<br />界線越要清楚。</h2><div className="trust-points">
          <article><span>01</span><div><h3>腕上確認</h3><p>重新啟動、註冊聲音與其他敏感動作，都在螢幕上明確說明後再執行。</p></div></article>
          <article><span>02</span><div><h3>斷線也不慌</h3><p>自動輪替已保存網路；無法連線時，直接顯示附近 Wi-Fi 與清楚的恢復路徑。</p></div></article>
          <article><span>03</span><div><h3>省電而不中斷</h3><p>AMOLED 熄屏、靜態像素位移與低電量模式，在續航與隨時可用之間取得平衡。</p></div></article>
        </div></div>
      </section>

      <section className="vision section-pad" id="vision">
        <FlowField compact /><p className="kicker"><span /> BUILT FOR EVERYDAY LIFE</p><h2>科技不需要看起來冰冷，<br />也不必讓人學會如何使用。</h2><p>我們正在把即時語音、工具呼叫與可信任的裝置控制，做成一款真正能每天佩戴的產品。</p><a className="primary-link" href="#experience">返回互動展示 <span>↑</span></a>
      </section>

      <footer><a className="wordmark" href="#top"><i />LUMEN</a><p>Personal intelligence, quietly present.</p><span>Concept 2026</span></footer>
    </main>
  );
}
