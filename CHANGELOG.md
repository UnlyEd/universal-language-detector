CHANGELOG
===

- v2.0.1 - 2020-02-04
    - [Enhancement] Use `@unly/iso3166-1` instead of `iso3166-1` (robustness)
- v2.0.0 - 2020-01-09
    - [Release] Release v2 with **breaking API changes**
        - Remove all stuff that was related to our internal business logic at Unly (this lib is a port of an internal project and was suffering from internal business logic/needs that shouldn't have been part of the Open Source release, they have been removed)
        - [BREAKING] Removed API function `universalLanguagesDetect` (plural), kept only `universalLanguageDetect`
        - [BREAKING] Renamed `acceptedLanguages` into `supportedLanguages` to avoid confusion with `accept-language` header
        - [BREAKING] Renamed `acceptLanguage` into `acceptLanguageHeader` for clarity
- v1.0.0 - 2019-12-30
    - [Release] Release production-ready 1.0.0 version
