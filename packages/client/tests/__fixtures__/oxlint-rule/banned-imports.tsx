// @ts-nocheck — fixture is not part of the build / tsc graph; it tests the linter.
// biome-ignore lint: this is a lint-rule fixture; banned imports are deliberate.

import { R2Bucket } from '@cloudflare/workers-types'
import { DuckDB } from '@duckdb/wasm'
import * as Sentry from '@sentry/react'
import { Link } from '@tanstack/react-router'

export const violations = { Sentry, Link, DuckDB, R2Bucket }
