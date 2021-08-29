import { useState } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';
import Header from '../components/Header';
import { formatDate } from '../util/format';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function handleNextPage(): Promise<void> {
    if (!nextPage) {
      return;
    }

    const response = await (await fetch(nextPage)).json();

    const newPosts = response.results.map((post: Post) => {
      return {
        uid: post?.uid,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
        first_publication_date: post.first_publication_date,
      };
    });

    setPosts([...posts, ...newPosts]);
    setNextPage(response.next_page);
  }

  return (
    <>
      <Head>
        <title>Home | space traveling</title>
      </Head>
      <Header />
      <main className={`${commonStyles.container} ${styles.posts}`}>
        {posts.map((post) => (
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <a>
              <div className={styles.post}>
                <h1>{post.data?.title}</h1>
                <h2>{post.data?.subtitle}</h2>
                <div className={styles.postInfo}>
                  <FiCalendar color="#D7D7D7" />
                  <time>{formatDate(post.first_publication_date)}</time>
                  <FiUser color="#D7D7D7" />
                  <span>{post.data.author}</span>
                </div>
              </div>
            </a>
          </Link>
        ))}
        {nextPage && (
          <button type="button" onClick={handleNextPage}>
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['slug', 'posts.title', 'posts.author', 'posts.subtitle'],
      orderings: '[document.first_publication_date]',
      pageSize: 1,
    },
  );

  const posts = response.results.map((post) => {
    return {
      uid: post?.uid,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      first_publication_date: post.first_publication_date,
    };
  });

  return {
    props: {
      postsPagination: { results: posts, next_page: response.next_page },
    },
  };
};
