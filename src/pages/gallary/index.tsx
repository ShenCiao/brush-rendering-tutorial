import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { usePluginData } from "@docusaurus/useGlobalData";
import styles from "../../components/gallary/gallary.module.css";
import { galleryMessages } from "../../components/gallary/messages";

interface Entry {
  id: string;
  path: string;
  title: string;
  thumbnail: string;
}

// Edit this copy to change the sentence below the Gallary heading.
const gallaryDescription = "";
function Card({ doc }: { doc: Entry }) {
  const copy = galleryMessages();
  const image = useBaseUrl(doc.thumbnail);
  return (
    <Link to={doc.path} className={styles.card}>
      <div className={styles.cover}>
        <img src={image} alt={doc.title} loading="lazy" />
        <span className={styles.badge}>{copy.artworkBadge}</span>
      </div>
      <div className={styles.cardTitle}>
        <h3>{doc.title}</h3>
        <span aria-hidden="true">↗</span>
      </div>
    </Link>
  );
}

export default function Gallary() {
  const copy = galleryMessages();
  const { artworks: docs } = usePluginData("gallary-index") as {
    artworks: Entry[];
  };
  return (
    <Layout title={copy.galleryTitle} description={copy.pageDescription}>
      <main className={styles.page}>
        <span className={styles.eyebrow}>{copy.eyebrow}</span>
        <h1 className={styles.heading}>{copy.galleryTitle}</h1>
        <p className={styles.intro}>{gallaryDescription}</p>
        <div className={styles.grid}>
          {docs.map((doc) => (
            <Card key={doc.id} doc={doc} />
          ))}
        </div>
      </main>
    </Layout>
  );
}
