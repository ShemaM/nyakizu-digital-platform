# TODO

- [ ] Fix React hydration mismatch on `frontend/src/app/page.tsx`.
  - [ ] Make hero background/glow deterministic between SSR and first client render (remove `mounted ? ... : ...` inline background branch).
  - [ ] Prevent footer year from differing between server/client (move year computation to client or hardcode).
  - [ ] Re-run Next dev / verify no hydration mismatch warnings.

