# Benchmark Scores

`scores.csv` records how each bug was handled across two approaches: **redfirst**
(triage intake → failing test committed first → fix) and **raw-agent** (fix applied
directly, no prior test).

Columns: `bug_id` identifies the issue; `method` is `redfirst`, `raw-agent`, or
`unfixed`; `wrote_repro_first` is `yes` when a RED test was committed before any
production change; `visible_suite` shows whether the public Jest suite passed after
the run; `notes` summarises the observable delta.

BUG-02 and BUG-04 each appear twice — once for the raw-agent baseline branch and
once for the RedFirst session — so the same one-line store fix can be compared with
and without a preceding repro test. BUG-01 (missing Content-Type → 500) and BUG-03
(DELETE not persisting across restarts) are intentionally left unfixed to preserve
scoring scenarios for the hackathon judging harness.
