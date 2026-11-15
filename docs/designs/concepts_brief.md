# Concepts brief — ₹1 Experiment

**Author:** Owner (name not supplied); drafted by assistant  
**Date:** 2026-11-13  
**Status:** Draft for owner review; not approved

## Problem
Test whether people will voluntarily send ₹1 or more to an openly described personal social experiment. The owner does not want a personal UPI ID or personal identity exposed to payers. A branded checkout does not by itself prove privacy.

## Agreed outcomes
- An English-first landing page with default ₹1, an editable amount without a project-imposed cap, UPI payment link and, if supported, a provider-issued QR.
- Verified supporter counter, public names only with consent, anonymous option, and a leaderboard ranked by cumulative confirmed amount. Updates follow verification without an additional amount-based display hold.
- Campaign target: 1,000 unique verified supporters in 30 days; definition of unique is profile-based, not a guarantee of distinct humans.
- Razorpay is the chosen provider to investigate. The owner will supply legitimate KYC directly to the provider, not to the agent.
- No personal UPI fallback. Voluntary contributions are non-refundable except genuine errors, subject to applicable law and provider terms.

## Constraints and unknowns
Razorpay has not confirmed the personal social-experiment use case, public beneficiary display, UPI QR eligibility, provider limits, fees, or identity exposure in payer apps and receipts. The project must not launch until these are confirmed and tested. Bank/provider controls may limit amounts despite no project cap.

## Possible approaches
- Provider checkout and order-specific payment links or QR with signed confirmation; plausible but subject to provider approval and testing.
- A branded merchant/bank account and QR: extra setup; identity shown depends on bank and provider; not selected as a fallback.
- Direct personal UPI: violates owner's explicit privacy requirement and is excluded.

## Human decisions still needed
Public name and precise use of funds, contact and refund process, campaign start date and time zone, recovery mechanism and proof requirements for identity merges, hosting/storage, and whether optional badges or weekly boards belong in the first release. Approval of this brief and design is still required.
