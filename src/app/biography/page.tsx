import { PageShell, EternalLightDivider } from "@/components/site-shell";
import Link from "next/link";

export const metadata = {
  title: "Her Story — Princess Gloria Mala Galabe",
};

export default function BiographyPage() {
  return (
    <PageShell>
      <article className="px-5 sm:px-8 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <header className="text-center mb-8">
            <p className="font-serif italic text-sm text-muted-foreground tracking-wide">
              Her Story
            </p>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl md:text-5xl text-plum">
              Princess Gloria Mala Galabe
            </h1>
            <p className="mt-3 text-foreground/70 text-sm sm:text-base">
              22 October 1965 &nbsp;—&nbsp; 24 June 2026
            </p>
          </header>

          <EternalLightDivider />

          <div className="prose-memorial">
            <p>
              Princess Gloria Mala Galabe was born on 22nd October 1965 to Fon
              Doh Galabe II and Queen Cecilia Nagwa Galabe, both of blessed
              memory. She answered the Lord&apos;s call on 24th June 2026,
              leaving behind a legacy of love, faith, compassion, and selfless
              service.
            </p>

            <p>
              Princess Gloria began her educational journey at RCM Bati
              Quarters, Balikumbat. She later joined her beloved elder sister,
              Princess Regina Galabe Kilo of blessed memory, first in Banso and
              subsequently in Buea, where she successfully obtained her First
              School Leaving Certificate in 1978.
            </p>

            <p>
              Driven by a desire to acquire practical skills, she enrolled at
              the prestigious Girls Technical College, Molyko, Buea. However,
              family responsibilities led her to relocate to Bafoussam to live
              with her elder sister. There, she trained as a professional hair
              dresser at one of the town&apos;s finest salons, mastering a trade
              that would become one of her life-long passions.
            </p>

            <p>
              When her elder sister was transferred to Yaoundé, Princess Gloria
              moved once again.
            </p>

            <p>
              In Yaoundé, she continued building her hair dressing business
              while pursuing further educational aspirations. Her determination,
              diligence, and integrity eventually earned her employment at the
              Ministry of External Relations (MINREX), where she served
              faithfully for six years.
            </p>

            <p>
              After voluntarily retiring from public service, she ventured into
              various business activities while remaining devoted to her salon
              profession.
            </p>

            <p>
              Princess Gloria believed that life was a gift meant to be lived
              purposefully. She disliked idleness and always kept herself
              engaged in meaningful and productive work. Her industrious spirit,
              creativity, and unwavering commitment to excellence inspired
              everyone who knew her.
            </p>

            <p>
              Beyond her professional life, she was a dedicated community member
              who willingly accepted positions of responsibility in the various
              associations and groups to which she belonged. She served
              faithfully, earning the respect and admiration of her peers
              through her humility, wisdom, and servant-hearted leadership.
            </p>

            <p>
              Princess Gloria was a woman of extraordinary kindness. She
              possessed a gentle heart, a welcoming smile, and an uncommon
              generosity that touched countless lives. To many, she was more
              than a relative or friend. She was a mother, mentor, confidante,
              and source of hope. Her home and heart were always open to those
              in need, and she gave without expecting anything in return.
            </p>

            <p>
              Above all, Princess Gloria was a devoted Christian whose faith in
              God remained steadfast throughout her life. Even in her final
              days, she demonstrated remarkable courage, unwavering trust in
              God, and complete surrender to His divine will. With a heart full
              of grace, she prayed not only for herself but also for those who
              had wronged her, asking God to forgive them. She equally sought
              forgiveness from anyone she may have offended, desiring to leave
              this world at peace with both God and humanity. Such was the
              beauty of her soul.
            </p>

            <p>
              Indeed, the words of Scripture echo triumphantly:
            </p>

            {/* 1 Corinthians 15:55 pull-quote — distinct styled block */}
            <blockquote className="pull-quote">
              &ldquo;O death, where is thy sting? O grave, where is thy
              victory?&rdquo;
              <footer className="mt-4 text-sm not-italic text-muted-foreground">
                1 Corinthians 15:55
              </footer>
            </blockquote>

            <p>
              Death has claimed her earthly body, but it could not conquer her
              victorious faith in Christ. Heaven has welcomed a faithful servant
              whose repentance was genuine and whose race was run with courage
              and hope.
            </p>

            <p>
              Princess Gloria leaves behind a loving daughter Mrs Angafor née
              Marceline Galabe, a devoted son Denzel, two cherished grand
              children Giovani Angafor and Eliora Angafor, countless children
              whose lives she nurtured with motherly affection, brothers,
              sisters, cousins, nieces, nephews, uncles, aunts, relatives,
              friends, and all whose lives were enriched by her boundless love
              and kindness. Though our hearts are heavy with grief, we thank
              God for the priceless gift that her life was to us all.
            </p>

            <p>
              As we mourn this painful loss, we pray that the Almighty God
              grants the entire family the strength, comfort, and grace to bear
              this great sorrow. We remain comforted by the blessed assurance
              that those who die in the Lord shall live forever with Him.
            </p>

            <p className="text-center font-serif italic text-plum text-lg mt-10">
              Eternal rest grant unto her, O Lord.
              <br />
              And let perpetual light shine upon her.
            </p>

            <p className="text-center font-serif italic text-plum mt-4">
              May the soul of Princess Gloria Mala Galabe, and the souls of all
              the faithful departed, through the mercy of God, rest in perfect
              peace. Amen.
            </p>
          </div>

          <EternalLightDivider className="!mt-16" />

          <div className="text-center mt-8">
            <Link
              href="/tributes/new"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-plum text-warm-white font-sans text-sm sm:text-base hover:opacity-90 transition-opacity min-h-[44px]"
            >
              Leave a tribute
            </Link>
          </div>
        </div>
      </article>
    </PageShell>
  );
}
