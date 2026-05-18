import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from "@vetaui/atoms";
import { EmptyState, Stat } from "@vetaui/molecules";
import { Container, Grid, Stack, Text } from "@vetaui/templates";
import { vetaSeed } from "@/lib/veta/seed";
import { appProvider, paymentsProvider } from "@/lib/veta/providers";
import { FormErrorSummary } from "@vetaui/forms-kit";

export default function PricingPage() {
  return (
    <main className="min-h-screen py-10">
      <Container size="lg">
        <Stack gap={6}>
          <section>
            <Badge variant="info">Launch page</Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Pricing</h1>
            <Text tone="muted" className="mt-2">
              Provider: {appProvider}. Payments: {paymentsProvider}. This route is generated as a real starting point, not a placeholder.
            </Text>
          </section>
          <Card>
            <CardHeader><CardTitle>Pricing form</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Work email" aria-label="Work email" />
              <FormErrorSummary errors={{ email: { type: "manual", message: "Use a valid work email." } }} />
              <Button>Save</Button>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </main>
  );
}
