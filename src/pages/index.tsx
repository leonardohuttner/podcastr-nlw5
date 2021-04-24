import { GetStaticProps } from 'next'
import Image from 'next/image'
import Head from 'next/head'
import Link from 'next/link'
import { api } from '../services/api'

import {format, parseISO } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

import { convertDurationToTimeString } from '../utils/convertDurationToTimeString'
import styles from './home.module.scss'
import { usePlayer } from '../contexts/PlayerContext'

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  publishedAt:string;
  duration:number;
  durationAsString:string;
  url:string;
}

type HomeProps = {
  latestedEpisodes: Episode[]
  allEpisodes: Episode[]
}

export default function Home({ latestedEpisodes, allEpisodes }: HomeProps) {
const { playList } = usePlayer()

const episodeList = [...latestedEpisodes,...allEpisodes];

  return (
    <div className={styles.homePage}>
      <Head>
        <title>Podcastr | Home </title>
      </Head>
      <section className={styles.latestedEpisodes}>
        <h2>Últimos lançamentos</h2>
        <ul>
          {latestedEpisodes.map((episode,index) =>{
            return(
              <li key={episode.id}>
                <Image
                    width={350}
                    height={192}
                    src={episode.thumbnail}
                    alt={episode.title}
                    objectFit="cover"
                  />
                <div className={styles.episodeDetails}>
                  <Link href={`/episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>
                <button type="button" onClick={() => playList(episodeList,index)}>
                  <img src="/play-green.svg" alt="Tocar"/>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
        <h2>Outros episódios</h2>
        <table cellSpacing={0}>
          <thead>
            <tr>
              <th></th>
              <th>Podcast</th>
              <th>Participantes</th>
              <th>Data</th>
              <th>Duração</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {allEpisodes.map((episode,index) => {
              return (
                <tr key={episode.id}>
                  <td style={{ width: 72}}>
                    <Image
                      width={120}
                      height={120}
                      src={episode.thumbnail}
                      alt={episode.title}
                      objectFit="cover"
                    />
                  </td>
                  <td>
                    <Link href={`/episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                    </Link>
                  </td>
                  <td> {episode.members} </td>
                  <td style={{width:150}}> {episode.publishedAt} </td>
                  <td> {episode.durationAsString} </td>
                  <td>
                    <button type="button" onClick={()=> playList(episodeList,index + latestedEpisodes.length)}>
                      <img src="/play-green.svg" alt=""/>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </div>
    )
}

export const getStaticProps: GetStaticProps = async  () => {
  const { data } = await api.get('episodes',{
    params:{
      _limit:12,
      _sort:'published_at',
      _order:'desc',
    }
  })

  const episodes = data.map(episode=>{
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members:episode.members,
      publishedAt: format(parseISO(episode.published_at),'d MMMM yy',{ locale:ptBR }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      url: episode.file.url
    }
  }) 

  const latestedEpisodes = episodes.slice(0,2)
  const allEpisodes = episodes.slice(2, episodes.lengh)


  return {
    props:{
      latestedEpisodes,
      allEpisodes
    },
    revalidate:60*60*8
  }
}
