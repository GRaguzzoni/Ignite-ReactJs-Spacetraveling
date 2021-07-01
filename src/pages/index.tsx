import { GetStaticProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import { FiCalendar, FiUser} from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';
import styles from './home.module.scss';
import { format } from 'date-fns';
import { useState } from 'react';
import { ptBR } from 'date-fns/locale';
import Header from '../components/Header';
import { ExitPreviewButton } from '../components/ExitPreviewButton';
import commonStyles from '../styles/common.module.scss'
import { IconContext } from 'react-icons/lib';

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
  preview: boolean;
}

export default function Home({postsPagination, preview}: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState<string | null>(postsPagination.next_page); 
  
  const newPostsLoader = async(): Promise<void> => {
    const response = await fetch(nextPage);
    const data = await response.json();

    const newPosts = data.results.map((post: Post) => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      }
    })

    setPosts([...posts, ...newPosts]);
    setNextPage(data.next_page);
  }


  return (    
    <>
      <IconContext.Provider value={{ style: { verticalAlign: 'middle' } }}>
        <Head>
          <title>Home | spacetraveling</title>
        </Head>
        <Header />
        {preview && <ExitPreviewButton />}
        <main className={commonStyles.container}>
          <div className={`${styles.posts} ${commonStyles.postsContainer}`}>
            {posts.map(post => (
              <Link href={`/post/${post.uid}`}>
                <a key={post?.uid}>
                  <strong>{post?.data?.title}</strong>
                  <p>{post?.data?.subtitle}</p>
                  <FiCalendar size="1.5rem" />
                  <time>
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </time>
                  <FiUser size="1.5rem" />
                  <span>{post?.data?.author}</span>
                </a>
              </Link>
            ))}
            {nextPage && (
              <button type="button" onClick={newPostsLoader}>
                Carregar mais posts
              </button>
            )}
          </div>
        </main>
      </IconContext.Provider>
    </>   
  )
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({
  preview = false,
  previewData,
}) => {
    const prismic = getPrismicClient();
    const postsResponse = await prismic.query([
      Prismic.predicates.at('document.type', 'post')
    ], {
      fetch:[
        'post.title', 
        'post.subtitle', 
        'post.author',             
      ],
      pageSize: 2,
      ref: previewData?.ref ?? null,
    })
    const {next_page} = postsResponse;
    const posts = postsResponse.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,        
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },                      
      }
    })

    return {
      props: {
        postsPagination: {
          next_page,
          results: posts,          
        },
        preview,
        
      }
    }
};
