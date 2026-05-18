"use client";

import { useState } from "react";

const styles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: .6; }
    50%       { opacity: 1; }
  }
  .aq-anim-1 { animation: fadeUp .5s .0s ease both; }
  .aq-anim-2 { animation: fadeUp .5s .1s ease both; }
  .aq-anim-3 { animation: fadeUp .5s .2s ease both; }
  .aq-anim-4 { animation: fadeUp .5s .3s ease both; }
  .aq-anim-5 { animation: fadeUp .5s .4s ease both; }
  .aq-anim-6 { animation: fadeUp .5s .1s ease both; }
  .aq-anim-7 { animation: fadeUp .5s .2s ease both; }
  .aq-anim-8 { animation: fadeUp .5s .3s ease both; }

  .aq-eyebrow-dot { animation: pulse 2s infinite; }

  .aq-input:focus  { border-color: #f59e0b !important; outline: none; }
  .aq-input::placeholder { color: #52525b; }

  .aq-btn-signin:hover  { opacity: .9; }
  .aq-btn-signin:active { transform: scale(.98); }

  .aq-demo-btn:hover {
    background: #0f0f16 !important;
    border-color: #1e1e28 !important;
  }

  .aq-feat { border-top: 1px solid #16161e; }
  .aq-feat:last-child { border-bottom: 1px solid #16161e; }

  /* grid overlay */
  .aq-grid-svg {
    position: absolute; inset: 0; width: 100%; height: 100%;
    pointer-events: none; opacity: .03;
  }
`;

const IconDiamond = ({ size = 16, color = "#080808" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const IconEdit = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
);

const IconActivity = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

const IconClock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
  </svg>
);

const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="#080808" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const IconUser = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconUsers = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconShield = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const features = [
  {
    icon: <IconEdit />,
    bg: "rgba(99,102,241,.1)",
    title: "Goal creation & approval",
    desc: "Employees set goals, managers approve and lock them — full workflow in minutes.",
  },
  {
    icon: <IconActivity />,
    bg: "rgba(52,211,153,.1)",
    title: "Quarterly check-ins",
    desc: "Log actuals every quarter. Track planned vs achieved with system-computed scores.",
  },
  {
    icon: <IconClock />,
    bg: "rgba(245,158,11,.1)",
    title: "Confidence map & momentum",
    desc: "Private confidence signals and streak tracking surface where your org needs support.",
  },
];

const demoRoles = [
  { label: "Employee", badge: "Demo", iconBg: "rgba(99,102,241,.12)", badgeBg: "#0d0d1f", badgeColor: "#8b8cf8", icon: <IconUser color="#6366f1" /> },
  { label: "Manager",  badge: "Demo", iconBg: "rgba(245,158,11,.12)",  badgeBg: "#1a1508", badgeColor: "#f59e0b", icon: <IconUsers color="#f59e0b" /> },
  { label: "Admin",    badge: "Demo", iconBg: "rgba(52,211,153,.12)",  badgeBg: "#051a10", badgeColor: "#34d399", icon: <IconShield color="#34d399" /> },
];

export default function LandingPage({ onLogin, onDemoLogin, onEntraLogin, isLoading, microsoftLoginError = "" }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = (e) => {
    e.preventDefault();
    onLogin?.({ email, password });
  };

  return (
    <>
      <style>{styles}</style>

      {/* Noise overlay */}
      <div style={{
        position:"fixed",inset:0,
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        pointerEvents:"none",zIndex:0,opacity:.6
      }}/>

      {/* Glow orbs */}
      <div style={{position:"fixed",width:500,height:500,background:"rgba(99,102,241,.06)",top:-100,right:-100,borderRadius:"50%",filter:"blur(120px)",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",width:400,height:400,background:"rgba(245,158,11,.04)",bottom:-50,left:-80,borderRadius:"50%",filter:"blur(120px)",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",width:300,height:300,background:"rgba(52,211,153,.03)",top:"40%",left:"30%",borderRadius:"50%",filter:"blur(120px)",pointerEvents:"none",zIndex:0}}/>

      <div style={{width:"100vw",minHeight:"100vh",display:"flex",flexDirection:"column",position:"relative",zIndex:1,background:"#06060a",fontFamily:"'DM Sans',sans-serif",color:"#f0f0f5",overflowX:"hidden"}}>

        {/* NAV */}
        <nav style={{height:60,width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 40px",borderBottom:"1px solid #16161e",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:30,height:30,background:"#f59e0b",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <IconDiamond />
            </div>
            <span style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,color:"#f0f0f5",letterSpacing:"-.02em"}}>
              Atom<span style={{color:"#f59e0b"}}>Quest</span>
            </span>
          </div>
          <span style={{fontSize:11,color:"#8a8a93",background:"#0d0d12",padding:"4px 12px",borderRadius:999,border:"1px solid #1e1e28"}}>
            Atomberg Technologies · Internal
          </span>
        </nav>

        {/* MAIN GRID */}
        <div style={{flex:1,width:"100%",display:"grid",gridTemplateColumns:"1fr 480px",minHeight:"calc(100vh - 60px)"}}>

          {/* HERO LEFT */}
          <div style={{padding:"80px 60px 60px",display:"flex",flexDirection:"column",justifyContent:"space-between",borderRight:"1px solid #16161e",position:"relative",overflow:"hidden"}}>

            {/* grid overlay */}
            <svg className="aq-grid-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="aqgrid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#aqgrid)"/>
            </svg>

            <div>
              {/* Eyebrow */}
              <div className="aq-anim-1" style={{display:"inline-flex",alignItems:"center",gap:8,fontSize:11,fontWeight:500,color:"#f59e0b",background:"#1a1508",padding:"5px 12px",borderRadius:999,border:"1px solid rgba(245,158,11,.15)",marginBottom:28,letterSpacing:".04em",textTransform:"uppercase"}}>
                <span className="aq-eyebrow-dot" style={{width:6,height:6,borderRadius:"50%",background:"#f59e0b",boxShadow:"0 0 8px #f59e0b",flexShrink:0}}/>
                FY 2025–26 · Q1 Check-in Open
              </div>

              {/* Title */}
              <h1 className="aq-anim-2" style={{fontFamily:"'Syne',sans-serif",fontSize:52,fontWeight:800,lineHeight:1.05,letterSpacing:"-.04em",marginBottom:24}}>
                Goals that<br/>
                <span style={{color:"#8a8a93"}}>get done.</span><br/>
                <span style={{background:"linear-gradient(135deg,#f59e0b,#fbbf24)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Not forgotten.</span>
              </h1>

              {/* Desc */}
              <p className="aq-anim-3" style={{fontSize:15,color:"#a1a1aa",lineHeight:1.7,maxWidth:440,fontWeight:300,marginBottom:40}}>
                AtomQuest replaces scattered spreadsheets and missed reviews with{" "}
                <b style={{color:"#e4e4e7",fontWeight:500}}>one clear system</b>{" "}
                — where every goal is set, tracked, and measured with full visibility.
              </p>

              {/* Features */}
              <div className="aq-anim-4">
                {features.map((f, i) => (
                  <div key={i} className="aq-feat" style={{display:"flex",alignItems:"flex-start",gap:14,padding:"18px 0"}}>
                    <div style={{width:34,height:34,borderRadius:8,background:f.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                      {f.icon}
                    </div>
                    <div>
                      <div style={{fontSize:13,fontWeight:500,color:"#a1a1aa",marginBottom:3}}>{f.title}</div>
                      <div style={{fontSize:12,color:"#8a8a93",lineHeight:1.5}}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="aq-anim-5" style={{display:"flex",gap:32}}>
              {[["100%","Weightage enforced"],["3 roles","Employee · Manager · Admin"],["Q1–Q4","Full cycle tracking"]].map(([n,l],i)=>(
                <div key={i}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,letterSpacing:"-.03em"}}>{n}</div>
                  <div style={{fontSize:11,color:"#8a8a93",marginTop:2}}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* SIGN IN RIGHT */}
          <div style={{background:"#0d0d12",display:"flex",flexDirection:"column",justifyContent:"center",padding:"60px 48px",position:"relative",overflow:"hidden"}}>

            {/* top accent line */}
            <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,#f59e0b,transparent)"}}/>

            {/* Heading */}
            <div className="aq-anim-6" style={{marginBottom:36}}>
              <div style={{fontSize:11,fontWeight:500,color:"#8a8a93",textTransform:"uppercase",letterSpacing:".1em",marginBottom:10}}>Internal portal</div>
              <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:700,letterSpacing:"-.03em",marginBottom:6}}>Welcome back.</h2>
              <p style={{fontSize:13,color:"#a1a1aa",lineHeight:1.6}}>Sign in to your AtomQuest account to manage your goals and track progress.</p>
            </div>

            {/* Form */}
            <form className="aq-anim-7" onSubmit={handleSignIn}>
              <div style={{marginBottom:16}}>
                <label style={{fontSize:12,fontWeight:500,color:"#a1a1aa",marginBottom:7,display:"block",letterSpacing:".01em"}}>Work email</label>
                <input
                  className="aq-input"
                  type="email"
                  placeholder="you@atomberg.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{width:"100%",background:"#0a0a0f",border:"1px solid #1e1e28",borderRadius:9,padding:"12px 15px",fontSize:14,color:"#f0f0f5",fontFamily:"'DM Sans',sans-serif",transition:"border-color .2s"}}
                />
              </div>
              <div style={{marginBottom:4}}>
                <label style={{fontSize:12,fontWeight:500,color:"#a1a1aa",marginBottom:7,display:"block",letterSpacing:".01em"}}>Password</label>
                <input
                  className="aq-input"
                  type="password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{width:"100%",background:"#0a0a0f",border:"1px solid #1e1e28",borderRadius:9,padding:"12px 15px",fontSize:14,color:"#f0f0f5",fontFamily:"'DM Sans',sans-serif",transition:"border-color .2s"}}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="aq-btn-signin"
                style={{width:"100%",padding:13,fontSize:14,fontWeight:600,background:"#f59e0b",color:"#080808",border:"none",borderRadius:9,cursor:isLoading ? "not-allowed" : "pointer",fontFamily:"'Syne',sans-serif",letterSpacing:"-.01em",marginTop:16,display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"opacity .15s,transform .1s"}}
              >
                {isLoading ? "Signing in..." : "Sign in"} <IconArrow />
              </button>
            </form>

            <button
              type="button"
              onClick={() => onEntraLogin?.()}
              disabled={isLoading}
              className="aq-anim-7 aq-demo-btn"
              style={{width:"100%",padding:13,fontSize:13,fontWeight:600,background:"#0a0a0f",color:"#e4e4e7",border:"1px solid #1e1e28",borderRadius:9,cursor:isLoading ? "not-allowed" : "pointer",fontFamily:"'Syne',sans-serif",letterSpacing:"-.01em",marginTop:12,display:"flex",alignItems:"center",justifyContent:"center",gap:10,transition:"opacity .15s,transform .1s"}}
            >
              <span style={{display:"inline-flex",width:18,height:18,borderRadius:4,background:"linear-gradient(135deg,#2b579a,#5b9bd5)",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff",fontWeight:700}}>M</span>
              Sign in with Microsoft
            </button>

            {microsoftLoginError && (
              <div
                className="aq-anim-7"
                role="alert"
                style={{
                  marginTop: 12,
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid rgba(224, 92, 92, 0.22)',
                  background: 'rgba(224, 92, 92, 0.08)',
                  color: '#f3b4b4',
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              >
                <div style={{fontWeight: 600, marginBottom: 2}}>Microsoft sign-in failed</div>
                <div>{microsoftLoginError}</div>
              </div>
            )}

            {/* Divider */}
            <div className="aq-anim-8" style={{display:"flex",alignItems:"center",gap:12,margin:"24px 0 20px"}}>
              <div style={{flex:1,height:1,background:"#16161e"}}/>
              <span style={{fontSize:11,color:"#8a8a93"}}>or continue as</span>
              <div style={{flex:1,height:1,background:"#16161e"}}/>
            </div>

            {/* Demo buttons */}
            <div className="aq-anim-8">
              <div style={{fontSize:10,fontWeight:500,color:"#8a8a93",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Demo accounts</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                {demoRoles.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    className="aq-demo-btn"
                    onClick={() => onDemoLogin?.(r.label.toLowerCase())}
                    disabled={isLoading}
                    style={{padding:"11px 6px",background:"#0a0a0f",border:"1px solid #1e1e28",borderRadius:9,cursor:isLoading ? "not-allowed" : "pointer",textAlign:"center",fontFamily:"'DM Sans',sans-serif",transition:"border-color .15s,background .15s"}}
                  >
                    <div style={{width:28,height:28,borderRadius:7,background:r.iconBg,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 7px"}}>
                      {r.icon}
                    </div>
                    <span style={{fontSize:12,fontWeight:500,color:"#a1a1aa",display:"block",marginBottom:3}}>{r.label}</span>
                    <span style={{fontSize:9,fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",padding:"2px 6px",borderRadius:999,background:r.badgeBg,color:r.badgeColor}}>{r.badge}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{marginTop:28,paddingTop:20,borderTop:"1px solid #16161e",fontSize:11,color:"#8a8a93",lineHeight:1.6,textAlign:"center"}}>
              Atomberg Technologies Internal Portal &nbsp;·&nbsp; FY 2025–26
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
