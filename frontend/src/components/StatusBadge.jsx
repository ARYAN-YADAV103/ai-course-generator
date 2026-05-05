import React from 'react';
import { Badge } from './Badge.jsx';

export function StatusBadge({ status }) {
  if (status.state === 'connected') return <Badge tone="success">API connected</Badge>;
  if (status.state === 'checking') return <Badge tone="warning">Checking API</Badge>;
  return <Badge tone="danger">API offline</Badge>;
}
