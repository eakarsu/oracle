const express = require('express');

function requiredSetting(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    const error = new Error(`AI service unavailable: ${name} is not configured`);
    error.status = 503;
    throw error;
  }
  return value;
}

function createAiVerificationRouter({ pool, fetchImpl = fetch } = {}) {
  const router = express.Router();

  router.post('/recommendation', async (req, res, next) => {
    try {
      const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
      if (!prompt || prompt.length > 4000) {
        return res.status(400).json({ error: 'prompt must contain 1 to 4000 characters' });
      }

      const apiKey = requiredSetting('OPENROUTER_API_KEY');
      const model = requiredSetting('OPENROUTER_MODEL');
      const baseUrl = requiredSetting('OPENROUTER_BASE_URL').replace(/\/$/, '');
      const response = await fetchImpl(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': `http://127.0.0.1:${process.env.FRONTEND_PORT || '3000'}`,
          'X-Title': 'Oracle Procurement Verification',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'Give one concise, practical procurement recommendation.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 160,
        }),
      });
      if (!response.ok) {
        const error = new Error(`AI provider request failed with status ${response.status}`);
        error.status = 502;
        throw error;
      }
      const payload = await response.json();
      const content = payload.choices?.[0]?.message?.content?.trim();
      const providerRequestId = typeof payload.id === 'string' ? payload.id.trim() : '';
      const resolvedModel = typeof payload.model === 'string' && payload.model.trim() ? payload.model.trim() : model;
      if (!content || !providerRequestId) {
        const error = new Error('AI provider returned an incomplete response');
        error.status = 502;
        throw error;
      }

      const saved = await pool.query(
        `INSERT INTO ai_provider_receipts
           (user_id, prompt, content, provider, provider_request_id, model)
         VALUES ($1, $2, $3, 'openrouter', $4, $5)
         RETURNING id, provider, provider_request_id, model, created_at`,
        [req.user.id, prompt, content, providerRequestId, resolvedModel],
      );
      return res.status(200).json({ content, model: resolvedModel, receipt: saved.rows[0], providerReceipt: saved.rows[0] });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}

module.exports = { createAiVerificationRouter };
