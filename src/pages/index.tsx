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

export default function Home({postsPagination}: HomeProps) {
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
      <Head>
        <title>Home | spacetraveling</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.content}>
          <img src="Logo.svg" alt="logo"/>                
          {posts.map( post => (           
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div>
                  <div>
                    <FiCalendar />
                    <time>{format(new Date(post.first_publication_date), 'dd MMM yyyy',{locale: ptBR})}</time>
                  </div>
                  <div>
                    <FiUser />
                    <span>{post.data.author}</span>
                  </div>
                </div>
              </a>
            </Link>
          ))}

          {nextPage && (
            <a 
              className={styles.more}
              href="/#"
              onClick={newPostsLoader}
            >Carregar mais posts</a>
          )}
        </div>   
      </main>

    </>    
  )
}

export const getStaticProps: GetStaticProps = async () => {
    const prismic = getPrismicClient();
    const postsResponse = await prismic.query([
      Prismic.predicates.at('document.type', 'post')
    ], {
      fetch:[
        'post.title', 
        'post.subtitle', 
        'post.author',             
        ],
        pageSize: 1,
    });
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
        revalidate: 60 * 30,
      }
    }
};
