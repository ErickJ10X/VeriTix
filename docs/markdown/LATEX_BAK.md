
**Limitaciones actuales del esquema (a considerar)**

| Limitación                                    | Implicación                                                                                                                        |
| :-------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| Ausencia de CHECK constraints                 | No se observan restricciones como `availableQuantity >= 0`, `totalQuantity >= availableQuantity` o `saleStartDate <= saleEndDate`. |
| `currency` como String                        | Requiere validación estricta de ISO.                                                                                               |
| FKs sin `onDelete` explícito en algunos casos | Conviene revisar políticas de borrado para producción.
