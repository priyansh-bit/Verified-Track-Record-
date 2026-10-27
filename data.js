/* ======================================================================
   TRADE REPORTS - DATA ONLY.  This is the only block you ever edit.

   OPTION A (recommended): UPDATE FROM A GOOGLE SHEET - no website edit.
     1. Import trade-reports-sheet.xlsx into Google Sheets.
     2. File > Share > Publish to web > choose the "Trades" sheet and the
        "Comma-separated values (.csv)" format > Publish. Copy the link.
     3. Paste the link between the quotes of SHEET_CSV_URL below. Done.
     From then on, add one row per trade in the sheet (date, trade, result
     TP or SL, status). The website reads the sheet every time it opens.
     Optional columns (symbol, direction, entry, exit, lot, rr) show up as
     table columns automatically once you fill them in. Avg RR is the average
     of the rr values you enter (2 or 1:2 both mean 1 : 2). Win Rate = TP / all trades.
     If the link is empty or fails, the built-in DAILY_REPORTS below is shown.

   OPTION B: edit DAILY_REPORTS below by hand (newest first), e.g.
     { date:"2026-10-27", trades:[ { no:1, result:"TP", status:"Closed", rr:2 } ] }

   MONTHLY_REPORTS: months are built automatically from the daily records,
   so a trade is only ever counted once. Add an entry only to attach notes /
   screenshots to a month, or a manual summary for a month with no daily rows:
     { month:"2026-09", notes:"...", screenshots:[{src:"shots/sep-1.png", caption:"..."}],
       summary:{ totalTrades:0, tpCount:0, slCount:0 } }
   A month with a manual summary uses ONLY that summary.
   ====================================================================== */
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSaXgIRwrkCElb9s4KDL_t7C5nyYHDw8FS2KBOYU6srf_NpAzcO9mkPSZ5abyRBjEZnAHiia0J-IamV/pub?output=csv";
const SHEET_CSV_FALLBACKS = ["https://docs.google.com/spreadsheets/d/1XrEAm8xHyitJ3G6xY-1rSyJpnMZC71uVCfAEoYEjZls/export?format=csv&gid=1747538043","https://docs.google.com/spreadsheets/d/1XrEAm8xHyitJ3G6xY-1rSyJpnMZC71uVCfAEoYEjZls/gviz/tq?tqx=out:csv&gid=1747538043"];   /* tried in order if the first link fails. Best option: paste the "Publish to web" CSV link as SHEET_CSV_URL */   /* live Google Sheet (Trades tab). Sheet must stay shared as "Anyone with the link: Viewer" */
const TELEGRAM = {
  channel: "https://t.me/tradingsignalfxknights",
  group:   "https://t.me/tradefxknight"
};
const TICKER_QUOTE = "“Protect capital first. Consistency is built on discipline.”";   /* the line shown in the gold top bar */
const DAILY_REPORTS = [
  { date: "2026-10-26",
    trades: [
      { no: 1, result: "TP", status: "Closed" },
      { no: 2, result: "SL", status: "Closed" }
    ] }
];
const MONTHLY_REPORTS = [
  { month: "2026-10", notes: "", screenshots: [] }
];
