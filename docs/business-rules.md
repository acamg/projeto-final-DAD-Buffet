# REGRAS DE NEGÓCIO — GESTÃO DE BUFFET E ORGANIZAÇÃO DE EVENTOS

Este documento consolida as diretrizes operacionais, comerciais e financeiras especificadas pelo `Agent_Buffet_Eventos` para direcionar as funcionalidades do sistema Buffet Manager.

---

## 1. CICLO DE VIDA DO EVENTO

Todo evento cadastrado no sistema obedece a uma máquina de estados finita:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  EM NEGOCIAÇÃO  │ ────> │   CONFIRMADO    │ ────> │    REALIZADO    │
└────────┬────────┘       └────────┬────────┘       └─────────────────┘
         │                         │
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│   CANCELADO     │ <──── │   CANCELADO     │
└─────────────────┘       └─────────────────┘
```

1. **Em Negociação**:
   - Fase de prospecção e envio de orçamentos. A data permanece pré-reservada, mas não bloqueia definitivamente o salão caso expire o prazo de validade da proposta.
2. **Confirmado**:
   - Assinatura de contrato e pagamento do sinal/reserva. A data, o local e as equipes são bloqueados.
3. **Realizado**:
   - Evento concluído. Habilita o fechamento de custos finais, despesas extras, quebras de louça e apuração do DRE (lucro real).
4. **Cancelado**:
   - Evento cancelado por qualquer das partes. Registra o motivo do cancelamento e eventuais retenções de multas contratuais.

---

## 2. FÓRMULA DE COMPOSIÇÃO DE ORÇAMENTOS E PRECIFICAÇÃO

O valor total do orçamento para um evento é composto pela seguinte equação:

$$\text{Valor Bruto} = (\text{Qtd Convidados} \times \text{Preço Unitário Cardápio}) + \text{Serviços Adicionais} + \text{Frete/Logística}$$

$$\text{Valor Líquido da Proposta} = \text{Valor Bruto} - \text{Descontos Autorizados}$$

### Apuração de Custos Vinculados:
$$\text{Custo Total} = \text{Custo de Insumos/Cardápio} + \text{Custo da Equipe (Diárias)} + \text{Custo de Fornecedores Externos} + \text{Custos Operacionais/Frete}$$

### Indicadores de Margem:
$$\text{Lucro Estimado (R\$)} = \text{Valor Líquido da Proposta} - \text{Custo Total}$$
$$\text{Margem de Lucro (\%)} = \left(\frac{\text{Lucro Estimado}}{\text{Valor Líquido da Proposta}}\right) \times 100$$

> [!IMPORTANT]
> **Alerta de Margem Crítica**: Se a margem calculada for inferior a **25%**, o sistema deve emitir um aviso visual no formulário de orçamento, exigindo confirmação do gestor antes do salvamento.

---

## 3. DIMENSIONAMENTO DE EQUIPE OPERACIONAL (REGRAS DE CONVENCIONAMENTO)

Para garantir qualidade no atendimento durante os eventos, o sistema sugere as seguintes proporções mínimas:

| Função | Evento Social Tradicional (Jantar) | Coquetel / Finger Food | Evento Infantil |
| :--- | :--- | :--- | :--- |
| **Garçom** | 1 para cada 12 a 15 convidados | 1 para cada 15 a 18 convidados | 1 para cada 20 convidados |
| **Cozinheiro / Chefe** | 1 para cada 50 a 60 convidados | 1 para cada 70 a 80 convidados | 1 para cada 60 convidados |
| **Copeiro / Lavador** | 1 para cada 50 convidados | 1 para cada 60 convidados | 1 para cada 50 convidados |
| **Coordenador / Metre** | 1 por evento (a partir de 60 convidados) | 1 por evento | 1 por evento |

---

## 4. GESTÃO DE CARDÁPIOS E RESTRIÇÕES ALIMENTARES

1. Cada cardápio cadastrado deve conter sua ficha técnica simplificada com lista de ingredientes e rendimento estimado por pessoa.
2. O sistema deve permitir o registro de restrições alimentares no cadastro do evento (e.g. celíacos, intolerantes a lactose, vegetarianos, veganos, alergênicos a castanhas/frutos do mar) para orientar a equipe de cozinha.
3. Itens infantis (crianças até 5 anos) podem receber isenção ou cobrança de meia-entrada (50% do valor do cardápio), parametrizável no orçamento.

---

## 5. POLÍTICA DE BACKUP E SEGURANÇA OPERACIONAL

- Antes de qualquer evento agendado para o final de semana, o sistema deve sugerir a geração de backup da base de dados e a exportação impressa/PDF das ordens de serviço (OS) e listas de convidados, prevenindo indisponibilidades locais de energia ou hardware.
