const express = require('express');
const https = require('https');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const router = express.Router();
router.use(authenticateToken);

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

async function callOpenRouter(messages, systemPrompt, options = {}) {
  const url = new URL(OPENROUTER_BASE_URL + '/chat/completions');

  const body = JSON.stringify({
    model: OPENROUTER_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ],
    max_tokens: options.max_tokens || 2000,
    temperature: options.temperature !== undefined ? options.temperature : 0.7,
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Oracle ERP AI Assistant',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(new Error('Failed to parse OpenRouter response'));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// General AI chat
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your-openrouter-api-key-here') {
      return res.status(400).json({
        error: 'OpenRouter API key not configured',
        message: 'Please set OPENROUTER_API_KEY in your .env file'
      });
    }

    const systemPrompt = `You are an AI assistant for Oracle ERP System. You help with business analytics, data insights, report generation, and business recommendations. Be professional, concise, and actionable. Context: ${context || 'General ERP assistance'}`;

    const result = await callOpenRouter(
      [{ role: 'user', content: message }],
      systemPrompt
    );

    if (result.error) {
      return res.status(400).json({ error: result.error.message || 'OpenRouter API error' });
    }

    const aiResponse = result.choices?.[0]?.message?.content || 'No response generated';

    // Save to history
    await pool.query(
      `INSERT INTO ai_chat_history (user_id, user_message, ai_response, context, model_used)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user.id, message, aiResponse, context || 'general', OPENROUTER_MODEL]
    );

    res.json({
      response: aiResponse,
      model: result.model || OPENROUTER_MODEL,
      usage: result.usage || {},
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ error: err.message });
  }
});

// AI Financial Analysis
router.post('/analyze-finance', async (req, res) => {
  try {
    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your-openrouter-api-key-here') {
      return res.status(400).json({ error: 'OpenRouter API key not configured' });
    }

    const financeData = await pool.query('SELECT * FROM finance_transactions ORDER BY transaction_date DESC LIMIT 50');

    const systemPrompt = 'You are a financial analyst AI for Oracle ERP. Analyze the financial data and provide insights, trends, and recommendations. Format your response with clear sections using markdown.';
    const userMessage = `Analyze this financial data and provide insights:\n${JSON.stringify(financeData.rows, null, 2)}`;

    const result = await callOpenRouter([{ role: 'user', content: userMessage }], systemPrompt);

    res.json({
      response: result.choices?.[0]?.message?.content || 'No analysis generated',
      model: result.model || OPENROUTER_MODEL,
      usage: result.usage || {},
      data_points: financeData.rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI HR Insights
router.post('/analyze-hr', async (req, res) => {
  try {
    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your-openrouter-api-key-here') {
      return res.status(400).json({ error: 'OpenRouter API key not configured' });
    }

    const hrData = await pool.query('SELECT * FROM hr_employees ORDER BY last_name');

    const systemPrompt = 'You are an HR analytics AI for Oracle ERP. Analyze workforce data and provide insights about team composition, salary distribution, and workforce recommendations. Format your response with clear sections using markdown.';
    const userMessage = `Analyze this HR data and provide workforce insights:\n${JSON.stringify(hrData.rows, null, 2)}`;

    const result = await callOpenRouter([{ role: 'user', content: userMessage }], systemPrompt);

    res.json({
      response: result.choices?.[0]?.message?.content || 'No analysis generated',
      model: result.model || OPENROUTER_MODEL,
      usage: result.usage || {},
      employees_analyzed: hrData.rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Sales Forecast
router.post('/forecast-sales', async (req, res) => {
  try {
    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your-openrouter-api-key-here') {
      return res.status(400).json({ error: 'OpenRouter API key not configured' });
    }

    const salesData = await pool.query('SELECT * FROM sales_orders ORDER BY order_date DESC');

    const systemPrompt = 'You are a sales forecasting AI for Oracle ERP. Analyze sales data and provide forecasts, trends, and strategic recommendations. Format your response with clear sections using markdown.';
    const userMessage = `Analyze this sales data and provide forecasting insights:\n${JSON.stringify(salesData.rows, null, 2)}`;

    const result = await callOpenRouter([{ role: 'user', content: userMessage }], systemPrompt);

    res.json({
      response: result.choices?.[0]?.message?.content || 'No forecast generated',
      model: result.model || OPENROUTER_MODEL,
      usage: result.usage || {},
      orders_analyzed: salesData.rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Inventory Optimization
router.post('/optimize-inventory', async (req, res) => {
  try {
    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your-openrouter-api-key-here') {
      return res.status(400).json({ error: 'OpenRouter API key not configured' });
    }

    const inventoryData = await pool.query('SELECT * FROM inventory_items ORDER BY name');

    const systemPrompt = 'You are an inventory optimization AI for Oracle ERP. Analyze inventory levels and provide optimization recommendations, reorder suggestions, and stock management insights. Format your response with clear sections using markdown.';
    const userMessage = `Analyze this inventory data and provide optimization recommendations:\n${JSON.stringify(inventoryData.rows, null, 2)}`;

    const result = await callOpenRouter([{ role: 'user', content: userMessage }], systemPrompt);

    res.json({
      response: result.choices?.[0]?.message?.content || 'No optimization generated',
      model: result.model || OPENROUTER_MODEL,
      usage: result.usage || {},
      items_analyzed: inventoryData.rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Risk Assessment
router.post('/assess-risk', async (req, res) => {
  try {
    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your-openrouter-api-key-here') {
      return res.status(400).json({ error: 'OpenRouter API key not configured' });
    }

    const [compliance, projects] = await Promise.all([
      pool.query('SELECT * FROM compliance_records'),
      pool.query('SELECT * FROM projects'),
    ]);

    const systemPrompt = 'You are a risk assessment AI for Oracle ERP. Analyze compliance and project data to identify risks, provide risk scores, and recommend mitigation strategies. Format your response with clear sections using markdown.';
    const userMessage = `Assess risks based on this data:\nCompliance Records: ${JSON.stringify(compliance.rows, null, 2)}\nProjects: ${JSON.stringify(projects.rows, null, 2)}`;

    const result = await callOpenRouter([{ role: 'user', content: userMessage }], systemPrompt);

    res.json({
      response: result.choices?.[0]?.message?.content || 'No assessment generated',
      model: result.model || OPENROUTER_MODEL,
      usage: result.usage || {},
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Fill Fields - parse natural language into form field values
router.post('/fill-fields', async (req, res) => {
  try {
    const { fields, description, moduleTitle, existingData } = req.body;

    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your-openrouter-api-key-here') {
      return res.status(400).json({ error: 'OpenRouter API key not configured' });
    }

    const fieldSchema = fields.map(f => {
      let desc = `"${f.name}" (${f.label}, type: ${f.type}`;
      if (f.options) desc += `, options: [${f.options.join(', ')}]`;
      if (f.required) desc += ', REQUIRED';
      desc += ')';
      return desc;
    }).join('\n');

    const systemPrompt = `You are a form auto-fill assistant for an ERP system. Given a natural language description, extract values for the specified form fields. Return ONLY a valid JSON object with field names as keys and extracted values. For select fields, use exact option values. For number fields, return numbers. For date fields, use YYYY-MM-DD format. Only include fields where you can confidently extract a value. Do not include any explanation, markdown, or extra text - just the JSON object.`;

    const existingNote = existingData && Object.keys(existingData).length > 0
      ? `\n\nExisting form data (only override if the description clearly specifies new values):\n${JSON.stringify(existingData)}`
      : '';

    const userMessage = `Module: ${moduleTitle}\n\nAvailable fields:\n${fieldSchema}\n\nUser description: "${description}"${existingNote}\n\nReturn JSON with matching field values:`;

    const result = await callOpenRouter(
      [{ role: 'user', content: userMessage }],
      systemPrompt,
      { temperature: 0.3, max_tokens: 1000 }
    );

    const content = result.choices?.[0]?.message?.content || '{}';
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (e) {
      parsed = {};
    }

    res.json({ fields: parsed, raw: content });
  } catch (err) {
    console.error('AI fill-fields error:', err);
    res.status(500).json({ error: err.message });
  }
});

// AI Summarize Records - analyze records and return markdown summary
router.post('/summarize-records', async (req, res) => {
  try {
    const { records, moduleTitle, recordCount, customPrompt } = req.body;

    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your-openrouter-api-key-here') {
      return res.status(400).json({ error: 'OpenRouter API key not configured' });
    }

    const systemPrompt = `You are a business data analyst for an ERP system. Analyze the provided records and generate a concise, insightful summary. Format your response in markdown with these sections:
## Overview
Brief summary of the dataset.
## Key Metrics
Important numbers and statistics.
## Trends
Notable patterns or trends.
## Anomalies
Anything unusual or concerning.
## Recommendations
Actionable suggestions based on the data.

Be specific with numbers and percentages. Keep it concise but insightful.`;

    const focus = customPrompt ? `\n\nUser's analysis request: "${customPrompt}"` : '';
    const userMessage = `Module: ${moduleTitle} (${recordCount} total records, showing ${records.length} below)\n\nRecords:\n${JSON.stringify(records, null, 2)}${focus}\n\nProvide a comprehensive summary:`;

    const result = await callOpenRouter(
      [{ role: 'user', content: userMessage }],
      systemPrompt,
      { temperature: 0.5, max_tokens: 2000 }
    );

    if (result.error) {
      return res.status(400).json({ error: result.error.message || 'OpenRouter API error' });
    }

    res.json({
      response: result.choices?.[0]?.message?.content || 'No summary generated',
      model: result.model || OPENROUTER_MODEL,
      usage: result.usage || {},
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('AI summarize error:', err);
    res.status(500).json({ error: err.message });
  }
});

// AI Record Summary - concise summary of a single record
router.post('/record-summary', async (req, res) => {
  try {
    const { record, moduleTitle } = req.body;

    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your-openrouter-api-key-here') {
      return res.status(400).json({ error: 'OpenRouter API key not configured' });
    }

    const systemPrompt = `You are a business analyst for an ERP system. Provide a clear, concise summary of the given record in markdown. Include:
## Summary
A plain-English description of what this record represents and its current state.
## Key Details
The most important fields and values, highlighting anything noteworthy.
## Status Assessment
Whether this record looks healthy, needs attention, or has any concerns.

Keep it brief and actionable. Reference actual values from the record.`;

    const userMessage = `Module: ${moduleTitle}\n\nRecord:\n${JSON.stringify(record, null, 2)}\n\nProvide a summary:`;

    const result = await callOpenRouter(
      [{ role: 'user', content: userMessage }],
      systemPrompt,
      { temperature: 0.4, max_tokens: 1500 }
    );

    if (result.error) {
      return res.status(400).json({ error: result.error.message || 'OpenRouter API error' });
    }

    res.json({
      response: result.choices?.[0]?.message?.content || 'No summary generated',
      model: result.model || OPENROUTER_MODEL,
      usage: result.usage || {},
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('AI record-summary error:', err);
    res.status(500).json({ error: err.message });
  }
});

// AI Record Insights - analyze a single record with context
router.post('/record-insights', async (req, res) => {
  try {
    const { record, allRecords, moduleTitle } = req.body;

    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your-openrouter-api-key-here') {
      return res.status(400).json({ error: 'OpenRouter API key not configured' });
    }

    const systemPrompt = `You are a business intelligence analyst for an ERP system. Analyze the selected record in context of other records in the same module. Format your response in markdown with these sections:
## Record Summary
Concise description of this specific record.
## Insights
What stands out about this record compared to others? Include comparisons and context.
## Recommendations
Specific actionable suggestions for this record.
## Suggested Follow-up Actions
Concrete next steps someone should take.

Be specific, reference actual values, and provide actionable insights.`;

    const contextRecords = allRecords ? allRecords.slice(0, 20) : [];
    const userMessage = `Module: ${moduleTitle}\n\nSelected Record:\n${JSON.stringify(record, null, 2)}\n\nOther records for context (${contextRecords.length} of ${allRecords?.length || 0}):\n${JSON.stringify(contextRecords, null, 2)}\n\nProvide insights:`;

    const result = await callOpenRouter(
      [{ role: 'user', content: userMessage }],
      systemPrompt,
      { temperature: 0.5, max_tokens: 2000 }
    );

    if (result.error) {
      return res.status(400).json({ error: result.error.message || 'OpenRouter API error' });
    }

    res.json({
      response: result.choices?.[0]?.message?.content || 'No insights generated',
      model: result.model || OPENROUTER_MODEL,
      usage: result.usage || {},
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('AI insights error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Budget simulator: simulate impact of budget allocation changes
router.post('/budget-simulator', async (req, res) => {
  try {
    const { scenario, budgetData } = req.body;

    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your-openrouter-api-key-here') {
      return res.status(400).json({ error: 'OpenRouter API key not configured' });
    }

    const systemPrompt = 'You are a corporate FP&A analyst for Oracle ERP. Given a proposed budget scenario and current budget data, simulate the financial impact across departments, projected variance, cash-flow implications, and risk highlights. Return a structured analysis with sections: Summary, Impact By Department, Variance Risks, Recommendations.';

    const userMessage = `Scenario:\n${scenario || '(none provided)'}\n\nCurrent Budget Data:\n${JSON.stringify(budgetData || {}, null, 2)}\n\nSimulate the impact:`;

    const result = await callOpenRouter(
      [{ role: 'user', content: userMessage }],
      systemPrompt,
      { temperature: 0.4, max_tokens: 2000 }
    );

    if (result.error) {
      return res.status(400).json({ error: result.error.message || 'OpenRouter API error' });
    }

    res.json({
      response: result.choices?.[0]?.message?.content || 'No simulation generated',
      model: result.model || OPENROUTER_MODEL,
      usage: result.usage || {},
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Budget simulator error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Tax optimizer: identify potential tax optimization opportunities
router.post('/tax-optimizer', async (req, res) => {
  try {
    const { taxContext, transactions } = req.body;

    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your-openrouter-api-key-here') {
      return res.status(400).json({ error: 'OpenRouter API key not configured' });
    }

    const systemPrompt = 'You are a senior tax strategist for Oracle ERP. Analyze the given tax context and transactions. Identify potential optimization opportunities, applicable credits/deductions, jurisdictional considerations, and compliance flags. Return structured output: Opportunities, Compliance Flags, Estimated Impact, Next Steps. Always recommend consulting a licensed tax professional.';

    const userMessage = `Tax Context:\n${taxContext || '(none provided)'}\n\nTransactions Sample:\n${JSON.stringify((transactions || []).slice(0, 25), null, 2)}\n\nIdentify tax optimization opportunities:`;

    const result = await callOpenRouter(
      [{ role: 'user', content: userMessage }],
      systemPrompt,
      { temperature: 0.4, max_tokens: 2000 }
    );

    if (result.error) {
      return res.status(400).json({ error: result.error.message || 'OpenRouter API error' });
    }

    res.json({
      response: result.choices?.[0]?.message?.content || 'No optimization generated',
      model: result.model || OPENROUTER_MODEL,
      usage: result.usage || {},
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Tax optimizer error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Contract analyzer: review procurement/vendor contracts for risk and key terms
router.post('/contract-analyzer', async (req, res) => {
  try {
    const { contractText, contractMeta } = req.body;

    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your-openrouter-api-key-here') {
      return res.status(400).json({ error: 'OpenRouter API key not configured' });
    }

    if (!contractText || typeof contractText !== 'string') {
      return res.status(400).json({ error: 'contractText (string) is required' });
    }

    const systemPrompt = 'You are a procurement contract analyst for Oracle ERP. Review the contract text and extract key terms (parties, term, value, payment terms, SLAs), identify risks (liability, indemnity, termination, auto-renewal, price escalators), and flag missing/ambiguous clauses. Return structured output: Key Terms, Risks, Missing Clauses, Recommended Actions. This is informational only and not legal advice.';

    const userMessage = `Contract Metadata:\n${JSON.stringify(contractMeta || {}, null, 2)}\n\nContract Text:\n${contractText.slice(0, 12000)}\n\nAnalyze the contract:`;

    const result = await callOpenRouter(
      [{ role: 'user', content: userMessage }],
      systemPrompt,
      { temperature: 0.3, max_tokens: 2200 }
    );

    if (result.error) {
      return res.status(400).json({ error: result.error.message || 'OpenRouter API error' });
    }

    res.json({
      response: result.choices?.[0]?.message?.content || 'No analysis generated',
      model: result.model || OPENROUTER_MODEL,
      usage: result.usage || {},
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Contract analyzer error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== Apply pass 4: Skills Matcher ====================
// POST /api/ai/skills-matcher
// Match employees / candidates against role skill requirements.
router.post('/skills-matcher', async (req, res) => {
  try {
    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your-openrouter-api-key-here') {
      return res.status(503).json({ error: 'AI service not configured (OPENROUTER_API_KEY missing)' });
    }

    const { roleTitle, requiredSkills, niceToHaveSkills, candidates } = req.body;
    if (!roleTitle || typeof roleTitle !== 'string') {
      return res.status(400).json({ error: 'roleTitle (string) is required' });
    }
    if (!Array.isArray(requiredSkills) || requiredSkills.length === 0) {
      return res.status(400).json({ error: 'requiredSkills (non-empty array) is required' });
    }

    let candidatePool = Array.isArray(candidates) ? candidates : [];
    if (candidatePool.length === 0) {
      try {
        const r = await pool.query(
          'SELECT id, name, position, department, skills FROM employees ORDER BY id LIMIT 50'
        );
        candidatePool = r.rows;
      } catch (e) {
        // employees table may not exist or have different shape — fall through with empty pool
        candidatePool = [];
      }
    }

    const systemPrompt = 'You are an Oracle ERP workforce planning assistant. Match the role requirements against the candidate pool. Return structured output with: Top Matches (ranked, with match score 0-100, matched skills, gaps, rationale), Skill Gap Analysis across the pool, Training/Upskilling Recommendations, and a one-paragraph executive summary. Be concise and actionable.';

    const userMessage = `Role: ${roleTitle}
Required Skills: ${JSON.stringify(requiredSkills)}
Nice-to-have Skills: ${JSON.stringify(niceToHaveSkills || [])}

Candidate Pool (${candidatePool.length}):
${JSON.stringify(candidatePool).slice(0, 6000)}

Match candidates to the role and provide the structured analysis.`;

    const result = await callOpenRouter(
      [{ role: 'user', content: userMessage }],
      systemPrompt,
      { temperature: 0.3, max_tokens: 2200 }
    );

    if (result.error) {
      return res.status(400).json({ error: result.error.message || 'OpenRouter API error' });
    }

    res.json({
      response: result.choices?.[0]?.message?.content || 'No analysis generated',
      model: result.model || OPENROUTER_MODEL,
      usage: result.usage || {},
      candidate_count: candidatePool.length,
      role_title: roleTitle,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Skills matcher error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get chat history
router.get('/history', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM ai_chat_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
