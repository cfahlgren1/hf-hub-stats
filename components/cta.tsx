import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function CTABanner() {
  return (
    <div className="space-y-6">
      <Card className="rounded-lg bg-primary text-primary-foreground">
        <CardContent className="flex flex-col items-center justify-between p-6 sm:flex-row">
          <div className="mb-4 sm:mb-0">
            <h3 className="text-2xl font-bold">Explore Data Further</h3>
            <p className="mt-2">Find more interesting insights with the Hugging Face Data Explorer Chrome Extension</p>
          </div>
          <Button asChild variant="secondary" size="lg">
            <Link href="https://chromewebstore.google.com/detail/hugging-face-data-explore/algkmpgdgbindfpddilldlogcbhpkhhd" target="_blank" rel="noopener noreferrer">
              Get Chrome Extension
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <iframe
            src="https://huggingface.co/datasets/cfahlgren1/hub-stats/embed/viewer/datasets/train"
            frameBorder="0"
            width="100%"
            height="560px"
            title="Hugging Face Dataset Viewer"
          />
        </CardContent>
      </Card>
    </div>
  )
}
