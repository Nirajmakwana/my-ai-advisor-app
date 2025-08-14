import React, { useMemo, useReducer, useRef } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import ProductCard from './components/ProductCard';
import { PRODUCT_CATALOG } from './catalog';

const initialState = { query: '', results: [], loading: false, error: null, mode: 'auto' /* auto | local | gemini */ };

function reducer(state, action) {
  switch (action.type) {
    case 'SET_QUERY': return { ...state, query: action.value };
    case 'LOADING': return { ...state, loading: true, error: null, results: [] };
    case 'ERROR': return { ...state, loading: false, error: action.error };
    case 'RESULTS': return { ...state, loading: false, results: action.results, error: null };
    case 'SET_MODE': return { ...state, mode: action.mode };
    default: return state;
  }
}

// Simple local scorer for offline/demo mode
function localScore(query, product) {
  const q = query.toLowerCase();
  const hay = [
    product.name, product.category, product.description,
    (product.cpu || ''), (product.ram || ''), (product.storage || ''),
    ...(product.features || [])
  ].join(' ').toLowerCase();
  let score = 0;
  q.split(/\W+/).forEach(tok => {
    if (!tok) return;
    if (hay.includes(tok)) score += tok.length;
  });
  // small boost if query mentions battery/weight and product has corresponding attributes
  if (/battery|long.*life/.test(q) && /battery|life/.test(hay)) score += 5;
  if (/light|weight|travel/.test(q) && (product.weightKg && product.weightKg < 1.3)) score += 5;
  return score;
}

async function callGemini(query, catalog) {
  const apiKey = Constants.expoConfig?.extra?.GEMINI_API_KEY || Constants.manifest2?.extra?.GEMINI_API_KEY || '';
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY in app config. Falling back to local mode.');

  const system = `You are an AI Product Advisor. Given a product catalog and a user's natural-language request,
return a concise JSON array of up to 5 recommendations. Each item must be:
{ "id": "<catalog id>", "reason": "<1-2 sentence rationale mapping features to the request>", "score": <0..1> }
Only recommend items that exist in the catalog by id. If nothing fits, return empty array.`;

  const prompt = [
    { role: 'user', parts: [{ text: system }]},
    { role: 'user', parts: [{ text:
`USER_REQUEST:
${query}

CATALOG (JSON):
${JSON.stringify(catalog)}
`} ]}
  ];

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: prompt, generationConfig: { temperature: 0.2, maxOutputTokens: 512 } })
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Gemini error: ${res.status} ${msg}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
  // best-effort JSON extraction
  const match = text.match(/\[[\s\S]*\]/);
  const jsonText = match ? match[0] : '[]';
  let arr = [];
  try { arr = JSON.parse(jsonText); } catch (e) { arr = []; }
  return arr;
}

export default function AdvisorScreen() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const inputRef = useRef(null);

  const handleSubmit = async () => {
    const query = state.query.trim();
    if (!query) return;
    dispatch({ type: 'LOADING' });

    const wantGemini = state.mode === 'gemini' || (state.mode === 'auto');
    try {
      if (wantGemini) {
        try {
          const recs = await callGemini(query, PRODUCT_CATALOG);
          if (Array.isArray(recs) && recs.length) {
            const results = recs
              .map(r => ({
                product: PRODUCT_CATALOG.find(p => p.id === r.id),
                reason: r.reason || '',
                score: r.score ?? 0
              }))
              .filter(x => !!x.product);
            if (results.length) {
              dispatch({ type: 'RESULTS', results });
              return;
            }
          }
        } catch (e) {
          // Fall through to local if gemini fails
          console.warn(e.message);
        }
      }

      // LOCAL fallback
      const scored = PRODUCT_CATALOG
        .map(p => ({ product: p, score: localScore(state.query, p) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(x => ({ ...x, reason: 'Matched your query keywords/features.' }));
      dispatch({ type: 'RESULTS', results: scored });
    } catch (err) {
      dispatch({ type: 'ERROR', error: err.message || 'Unknown error' });
    }
  };

  const header = useMemo(() => 'AI Product Advisor', []);

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.title}>{header}</Text>
      <Text style={styles.subtitle}>Describe what you need. Example: "I need a lightweight laptop for travel with a long battery life."</Text>

      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Type your request..."
          value={state.query}
          onChangeText={t => dispatch({ type: 'SET_QUERY', value: t })}
          multiline
        />
      </View>

      <View style={styles.actions}>
        <Pressable onPress={() => dispatch({ type: 'SET_MODE', mode: state.mode === 'local' ? 'gemini' : 'local' })} style={styles.modeBtn}>
          <Text style={styles.modeText}>Mode: {state.mode === 'local' ? 'Local' : state.mode === 'gemini' ? 'Gemini' : 'Auto'}</Text>
        </Pressable>
        <Pressable onPress={handleSubmit} style={styles.cta}>
          {state.loading ? <ActivityIndicator /> : <Text style={styles.ctaText}>Get recommendations</Text>}
        </Pressable>
      </View>

      {state.error ? <Text style={styles.error}>Error: {state.error}</Text> : null}

      <ScrollView style={{ marginTop: 12 }}>
        {state.results.map((r) => (
          <ProductCard key={r.product.id} product={r.product} reason={r.reason} />
        ))}
        {!state.loading && !state.results.length && !state.error ? (
          <Text style={{ textAlign: 'center', color: '#64748b', marginTop: 24 }}>No results yet. Try a query above.</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  subtitle: { marginTop: 6, color: '#475569' },
  inputRow: { marginTop: 12 },
  input: { backgroundColor: 'white', minHeight: 70, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  cta: { backgroundColor: '#111827', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: 'white', fontWeight: '600' },
  modeBtn: { paddingHorizontal: 12, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' },
  modeText: { color: '#0f172a' },
  error: { color: '#b91c1c', marginTop: 8 }
});
